import { Election } from '../../../domain_model/Election';
import Logger from '../Services/Logging/Logger';
const { Pool } = require('pg');

class ElectionsDB {

    _postgresClient;
    _tableName: string;

    constructor(postgresClient:any) {
        this._postgresClient = postgresClient;
        this._tableName = "electionDB";
        this.init()
    }

    init(): Promise<ElectionsDB> {
        var appInitContext = Logger.createContext("appInit");
        Logger.debug(appInitContext, "-> ElectionsDB.init")
        var query = `
        CREATE TABLE IF NOT EXISTS ${this._tableName} (
            election_id  SERIAL PRIMARY KEY,
            title       VARCHAR,
            description TEXT,
            frontend_url VARCHAR,
            start_time    VARCHAR, 
            end_time      VARCHAR, 
            support_email VARCHAR,
            owner_id      VARCHAR,
            audit_ids     json,
            admin_ids     json,
            credential_ids json,
            state         VARCHAR,
            races         json NOT NULL,
            settings      json
          );
        `;
        Logger.debug(appInitContext, query);
        var p = this._postgresClient.query(query);
        return p.then((_: any) => {
            //This will add the new field to the live DB in prod.  Once that's done we can remove this
            var credentialQuery = `
            ALTER TABLE ${this._tableName} ADD COLUMN IF NOT EXISTS credential_ids json
            `;
            return this._postgresClient.query(credentialQuery).catch((err:any) => {
                console.log("err adding credential_ids column to DB: " + err.message);
                return err;
            });
        }).then((_:any)=> {
            return this;
        });
    }

    createElection(election: Election): Promise<Election> {
        console.log(`-> ElectionDB.create`);
        var sqlString = `INSERT INTO ${this._tableName} (title,description,frontend_url,start_time,end_time,support_email,owner_id,audit_ids,admin_ids,credential_ids,state,races,settings)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13) RETURNING *;`;

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election.title,
            election.description,
            election.frontend_url,
            election.start_time,
            election.end_time,
            election.support_email,
            election.owner_id,
            JSON.stringify(election.audit_ids),
            JSON.stringify(election.admin_ids),
            JSON.stringify(election.credential_ids),
            election.state,
            JSON.stringify(election.races),
            JSON.stringify(election.settings)]
        });

        return p.then((res: any) => {
            // console.log(res);
            return res.rows[0];
        });
    }

    updateElection(election: Election): Promise<Election> {
        console.log(`-> ElectionDB.update ${election.election_id}`);
        var sqlString = `UPDATE ${this._tableName} SET (title,description,frontend_url,start_time,end_time,support_email,owner_id,audit_ids,admin_ids,credential_ids,state,races,settings) =
        ($2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) WHERE election_id = $1 RETURNING *;`;

        var p = this._postgresClient.query({
            text: sqlString,
            values: [
                election.election_id,
                election.title,
                election.description,
                election.frontend_url,
                election.start_time,
                election.end_time,
                election.support_email,
                election.owner_id,
                JSON.stringify(election.audit_ids),
                JSON.stringify(election.admin_ids),
                JSON.stringify(election.credential_ids),
                election.state,
                JSON.stringify(election.races),
                JSON.stringify(election.settings)
            ]
        });

        return p.then((res: any) => {
            // console.log(res);
            return res.rows[0];
        });
    }

    getElections(filter: string): Promise<Election[] | null> {
        // When I filter in trello it adds "filter=member:arendpetercastelein,overdue:true" to the URL, I'm following the same pattern here

        console.log(`-> ElectionDB.getAll`);
        var sqlString = `SELECT * FROM ${this._tableName}`;
        if (filter != "") {
            var filters = filter.split(',');
            if (filters.length > 0) {
                sqlString = `${sqlString} WHERE`
            }
            for (var i = 0; i < filters.length; i++) {
                var [key, value] = filters[i].split(':');
                sqlString = `${sqlString} ${key}='${value}'`
            }
        }
        console.log(sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: []
        });
        return p.then((response: any) => {
            var rows = response.rows;
            if (rows.length == 0) {
                console.log(".get null");
                return [] as Election[];
            }
            return rows
        });
    }

    getElectionByID(election_id: string): Promise<Election | null> {
        console.log(`-> ElectionDB.getElectionByID ${election_id}`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1`;
        console.log(sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id]
        });
        return p.then((response: any) => {
            var rows = response.rows;
            if (rows.length == 0) {
                console.log(".get null");
                return null;
            }
            return rows[0] as Election;
        });
    }

    delete(election_id: string): Promise<boolean> {
        console.log(`-> ElectionDB.delete ${election_id}`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE election_id = $1`;
        console.log(sqlString);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [election_id]
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                return true;
            }
            return false;
        });
    }
}

module.exports = ElectionsDB