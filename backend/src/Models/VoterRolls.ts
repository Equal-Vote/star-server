import { VoterRoll } from '../../../domain_model/VoterRoll';
const { Pool } = require('pg');
var format = require('pg-format');
class VoterRollDB {

    _postgresClient;
    _tableName: string;

    constructor() {
        this._tableName = "voterRollDB";
        this._postgresClient = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
            ssl:  false
        });
        this.init()
    }

    init(): Promise<VoterRollDB> {
        console.log("VoterRollDB.init");
        var query = `
        CREATE TABLE IF NOT EXISTS ${this._tableName} (
            election_id     INTEGER NOT NULL,
            voter_id        VARCHAR NOT NULL,
            ballot_id       INTEGER,
            submitted       BOOLEAN,
            PRIMARY KEY(election_id,voter_id)
          );
        `;
        console.log(query);
        var p = this._postgresClient.query(query);
        return p.then((_: any) => {
            return this;
        });
    }

    submitVoterRoll(election_id: number, voter_ids: string[],submitted:Boolean): Promise<boolean> {
        console.log(`VoterRollDB.submit`);
        var values = voter_ids.map((voter_id) => ([election_id,
            voter_id,
            submitted]))
        var sqlString = format(`INSERT INTO ${this._tableName} (election_id,voter_id,submitted)
        VALUES %L;`, values);
        console.log(sqlString)
        
        console.log(values)
        var p = this._postgresClient.query(sqlString);
        return p.then((res: any) => {
            console.log("set response rows: " + JSON.stringify(res));
            return true;
        });
    }

    getRollsByElectionID(election_id: string): Promise<VoterRoll[] | null> {
        console.log(`VoterRollDB.getByElectionID`);
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
    getByVoterID(election_id: string,voter_id:string): Promise<VoterRoll | null> {
        console.log(`VoterRollDB.getByVoterID`);
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
    update(voter_roll: VoterRoll): Promise<VoterRoll | null> {
        console.log(`VoterRollDB.updateRoll`);
        var sqlString = `UPDATE ${this._tableName} SET ballot_id=$1, submitted=$2  WHERE election_id = $3 AND voter_id=$4`;
        console.log(sqlString);
        console.log(voter_roll)
        var p = this._postgresClient.query({
            text: sqlString,
            values: [voter_roll.ballot_id,voter_roll.submitted,voter_roll.election_id, voter_roll.voter_id]
        });
        return p.then((response: any) => {
            var rows = response.rows;
            console.log(response)
            if (rows.length == 0) {
                console.log(".get null");
                return [] as VoterRoll[];
            }
            return rows
        });
    }

    delete(voter_roll: VoterRoll): Promise<boolean> {
        console.log(`VoterRollDB.delete`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE election_id = $1 AND voter_id=$2`;
        console.log(sqlString);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [voter_roll.election_id, voter_roll.voter_id]
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                return true;
            }
            return false;
        });
    }
}

module.exports = VoterRollDB