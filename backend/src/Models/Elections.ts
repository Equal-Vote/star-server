import { Election } from '../../../domain_model/Election';
import { Uid } from '../../../domain_model/Uid';
import { ILoggingContext } from '../Services/Logging/ILogger';
import Logger from '../Services/Logging/Logger';
const className = 'ElectionsDB';

export default class ElectionsDB {

    _postgresClient;
    _tableName: string;

    constructor(postgresClient: any) {
        this._postgresClient = postgresClient;
        this._tableName = "electionDB";
        this.init()
    }

    async init(): Promise<ElectionsDB> {
        var appInitContext = Logger.createContext("appInit");
        Logger.debug(appInitContext, "-> ElectionsDB.init")

        //await this.dropTable(appInitContext);

        var query = `
        CREATE TABLE IF NOT EXISTS ${this._tableName} (
            election_id  VARCHAR PRIMARY KEY,
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
            settings      json,
            auth_key      VARCHAR
          );
        `;

        Logger.debug(appInitContext, query);
        var p = this._postgresClient.query(query);
        return p.then((_: any) => {
            //This will add the new field to the live DB in prod.  Once that's done we can remove this
            var credentialQuery = `
            ALTER TABLE ${this._tableName} ADD COLUMN IF NOT EXISTS auth_key VARCHAR
            `;
            return this._postgresClient.query(credentialQuery).catch((err: any) => {
                console.log("err adding credential_ids column to DB: " + err.message);
                return err;
            });
        }).then((_: any) => {
            return this;
        });
    }

    async dropTable(ctx: ILoggingContext): Promise<void> {
        var query = `DROP TABLE IF EXISTS ${this._tableName};`;
        var p = this._postgresClient.query({
            text: query,
        });
        return p.then((_: any) => {
            Logger.debug(ctx, `Dropped it (like its hot)`);
        });
    }

    createElection(election: Election, ctx: ILoggingContext, reason: string): Promise<Election> {
        Logger.debug(ctx, `${className}.createElection`, election);

        var sqlString = `INSERT INTO ${this._tableName} (election_id, title,description,frontend_url,start_time,end_time,support_email,owner_id,audit_ids,admin_ids,credential_ids,state,races,settings,auth_key)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *;`;
        Logger.debug(ctx, sqlString);

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
                JSON.stringify(election.settings),
                election.auth_key
            ]
        });

        return p.then((res: any) => {
            const newElection = res.rows[0];
            Logger.state(ctx, `Election created:`, { reason: reason, election: newElection });
            return newElection;
        }).catch((err: any) => {
            Logger.error(ctx, "Error with postgres createElection:  " + err.message);
            throw err;
        });
    }

    updateElection(election: Election, ctx: ILoggingContext, reason: string): Promise<Election> {
        Logger.debug(ctx, `${className}.updateElection`, election);
        var sqlString = `UPDATE ${this._tableName} SET (title,description,frontend_url,start_time,end_time,support_email,owner_id,audit_ids,admin_ids,credential_ids,state,races,settings,auth_key) =
        ($2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) WHERE election_id = $1 RETURNING *;`;
        Logger.debug(ctx, sqlString);

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
                JSON.stringify(election.settings),
                election.auth_key
            ]
        });

        return p.then((res: any) => {
            const updatedElection = res.rows[0];
            Logger.state(ctx, `Election Updated:`, { reason: reason, election: updatedElection });
            return updatedElection;
        });
    }

    getElections(id: string, email: string, ctx: ILoggingContext): Promise<Election[] | null> {
        // When I filter in trello it adds "filter=member:arendpetercastelein,overdue:true" to the URL, I'm following the same pattern here
        Logger.debug(ctx, `${className}.getAll ${id} ${email}`);

        var sqlString = `SELECT * FROM ${this._tableName}`;
        let values: any[] = []
        if (id !== '' || email !== '') {
            sqlString += ' WHERE owner_id=$1 OR admin_ids::jsonb ? $2 OR audit_ids::jsonb ? $3 OR credential_ids::jsonb ? $4 '
            values = [id,email,email,email]
        }
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: values
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

    getElectionByID(election_id: Uid, ctx: ILoggingContext): Promise<Election | null> {
        Logger.debug(ctx, `${className}.getElectionByID ${election_id}`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id]
        });
        return p.then((response: any) => {
            var rows = response.rows;
            if (rows.length == 0) {
                Logger.debug(ctx, `.get null`);
                return null;
            }
            return rows[0] as Election;
        });
    }

    getElectionByIDs(election_ids: Uid[], ctx: ILoggingContext): Promise<Election[] | null> {
        Logger.debug(ctx, `${className}.getElectionByIDs ${election_ids.join(',')}`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id IN ('${election_ids.join(',')}')`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: []
        });
        return p.then((response: any) => {
            var rows = response.rows;
            if (rows.length == 0) {
                Logger.debug(ctx, `.get null`);
                return null;
            }
            return rows as Election[];
        });
    }

    delete(election_id: Uid, ctx: ILoggingContext, reason: string): Promise<boolean> {
        Logger.debug(ctx, `${className}.delete ${election_id}`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE election_id = $1`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [election_id]
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                Logger.state(ctx, `Election Deleted:`, { reason: reason, electionId: election_id });
                return true;
            }
            return false;
        });
    }
}