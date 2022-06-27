import { ElectionRoll, ElectionRollAction } from '../../../domain_model/ElectionRoll';
import Logger from '../Services/Logging/Logger';
const { Pool } = require('pg');
var format = require('pg-format');
class ElectionRollDB {

    _postgresClient;
    _tableName: string;

    constructor(postgresClient:any) {
        this._postgresClient = postgresClient;
        this._tableName = "electionRollDB";
        this.init()
    }

    init(): Promise<ElectionRollDB> {
        var appInitContext = Logger.createContext("appInit");
        Logger.debug(appInitContext, "-> ElectionRollDB.init");
        var query = `
        CREATE TABLE IF NOT EXISTS ${this._tableName} (
            election_id     INTEGER NOT NULL,
            voter_id        VARCHAR NOT NULL,
            ballot_id       INTEGER,
            submitted       BOOLEAN,
            PRIMARY KEY(election_id,voter_id),
            state           VARCHAR NOT NULL,
            history         json
          );
        `;
        Logger.debug(appInitContext, query);
        var p = this._postgresClient.query(query);
        return p.then((_: any) => {
            //This will add the new field to the live DB in prod.  Once that's done we can remove this
            var historyQuery = `
            ALTER TABLE ${this._tableName} ADD COLUMN IF NOT EXISTS history json
            `;
            return this._postgresClient.query(historyQuery).catch((err:any) => {
                console.log("err adding history column to DB: " + err.message);
                return err;
            });
        }).then((_:any)=> {
            return this;
        });
    }


    submitElectionRoll(election_id: number, voter_ids: string[], submitted: Boolean, state: string, history: ElectionRollAction): Promise<boolean> {
        console.log(`-> ElectionRollDB.submit`);
        var values = voter_ids.map((voter_id) => ([election_id,
            voter_id,
            submitted,
            state,
            JSON.stringify(history)]))
        var sqlString = format(`INSERT INTO ${this._tableName} (election_id,voter_id,submitted,state,history)
        VALUES %L;`, values);
        console.log(sqlString)
        console.log(values)
        var p = this._postgresClient.query(sqlString);
        return p.then((res: any) => {
            console.log("set response rows: " + JSON.stringify(res));
            return true;
        });
    }

    getRollsByElectionID(election_id: string): Promise<ElectionRoll[] | null> {
        console.log(`-> ElectionRollDB.getByElectionID`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1`;
        console.log(sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id]
        });
        return p.then((response: any) => {
            var rows = response.rows;
            console.log(rows[0])
            if (rows.length == 0) {
                console.log(".get null");
                return [];
            }
            return rows
        });
    }

    getByVoterID(election_id: string, voter_id: string): Promise<ElectionRoll | null> {
        console.log(`-> ElectionRollDB.getByVoterID`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1 AND voter_id = $2`;
        console.log(sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id, voter_id]
        });
        return p.then((response: any) => {
            var rows = response.rows;
            console.log(rows[0])
            if (rows.length == 0) {
                console.log(".get null");
                return [];
            }
            return rows[0]
        });
    }
    update(election_roll: ElectionRoll): Promise<ElectionRoll | null> {
        console.log(`-> ElectionRollDB.updateRoll`);
        var sqlString = `UPDATE ${this._tableName} SET ballot_id=$1, submitted=$2, state, history=$3  WHERE election_id = $3 AND voter_id=$4`;
        console.log(sqlString);
        console.log(election_roll)
        var p = this._postgresClient.query({
            text: sqlString,

            values: [election_roll.ballot_id, election_roll.submitted, election_roll.state, election_roll.history, election_roll.election_id, election_roll.voter_id]

        });
        return p.then((response: any) => {
            var rows = response.rows;
            console.log(response)
            if (rows.length == 0) {
                console.log(".get null");
                return [] as ElectionRoll[];
            }
            return rows
        });
    }

    delete(election_roll: ElectionRoll): Promise<boolean> {
        console.log(`-> ElectionRollDB.delete`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE election_id = $1 AND voter_id=$2`;
        console.log(sqlString);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [election_roll.election_id, election_roll.voter_id]
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                return true;
            }
            return false;
        });
    }
}

module.exports = ElectionRollDB