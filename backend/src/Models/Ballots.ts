import { Ballot } from '../../../domain_model/Ballot';
import Logger from '../Services/Logging/Logger';
const { Pool } = require('pg');

class BallotsDB {

    _postgresClient;
    _tableName: string;

    constructor(postgresClient:any) {
        this._tableName = "ballotDB";
        this._postgresClient = postgresClient;
        this.init();
    }

    init(): Promise<BallotsDB> {
        var appInitContext = Logger.createContext("appInit");
        Logger.debug(appInitContext, "-> BallotsDB.init");
        var query = `
        CREATE TABLE IF NOT EXISTS ${this._tableName} (
            ballot_id       SERIAL PRIMARY KEY,
            election_id     VARCHAR,
            user_id         VARCHAR,
            status          VARCHAR,
            date_submitted  VARCHAR,
            ip_address      VARCHAR, 
            votes           json NOT NULL
          );
        `;
        Logger.debug(appInitContext, query);
        var p = this._postgresClient.query(query);
        return p.then((_: any) => {
            return this;
        });
    }

    submitBallot(ballot: Ballot): Promise<string> {
        console.log(`-> BallotsDB.submit`);
        var sqlString = `INSERT INTO ${this._tableName} (election_id,user_id,status,date_submitted,ip_address,votes)
        VALUES($1, $2, $3, $4, $5, $6);`;
        console.log(sqlString)
        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [ballot.election_id,
            ballot.user_id,
            ballot.status,
            ballot.date_submitted,
            ballot.ip_address,
            JSON.stringify(ballot.votes)]
        });

        return p.then((res: any) => {
            console.log("set response rows: " + JSON.stringify(res));
            return ballot;
        });
    }

    getBallotsByElectionID(election_id: string): Promise<Ballot[] | null> {
        console.log(`-> BallotsDB.getByElectionID ${election_id}`);
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
                return [] as Ballot[];
            }
            return rows
        });
    }

    delete(ballot_id: string): Promise<boolean> {
        console.log(`-> BallotsDB.delete ${ballot_id}`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE ballot_id = $1`;
        console.log(sqlString);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [ballot_id]
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                return true;
            }
            return false;
        });
    }
}

module.exports = BallotsDB