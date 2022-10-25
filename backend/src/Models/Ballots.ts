import { Ballot } from '../../../domain_model/Ballot';
import { Uid } from '../../../domain_model/Uid';
import { ILoggingContext } from '../Services/Logging/ILogger';
import Logger from '../Services/Logging/Logger';
import { IBallotStore } from './IBallotStore';
const className = 'BallotsDB';

export default class BallotsDB implements IBallotStore {

    _postgresClient;
    _tableName: string;

    constructor(postgresClient:any) {
        this._tableName = "ballotDB";
        this._postgresClient = postgresClient;
        this.init();
    }

    async init(): Promise<IBallotStore> {
        var appInitContext = Logger.createContext("appInit");
        Logger.debug(appInitContext, "BallotsDB.init");
        //await this.dropTable(appInitContext);
        var query = `
        CREATE TABLE IF NOT EXISTS ${this._tableName} (
            ballot_id       VARCHAR PRIMARY KEY,
            election_id     VARCHAR,
            user_id         VARCHAR,
            status          VARCHAR,
            date_submitted  VARCHAR,
            ip_address      VARCHAR, 
            votes           json NOT NULL,
            history         json,
            precinct        VARCHAR
          );
        `;
        Logger.debug(appInitContext, query);
        var p = this._postgresClient.query(query);
        return p.then((_: any) => {
            //This will add the new field to the live DB in prod.  Once that's done we can remove this
            var historyQuery = `
            ALTER TABLE ${this._tableName} ADD COLUMN IF NOT EXISTS precinct VARCHAR
            `;
            return this._postgresClient.query(historyQuery).catch((err:any) => {
                Logger.error(appInitContext, "err adding precinct column to DB: " + err.message);
                return err;
            });
        }).then((_:any)=> {
            return this;
        });
    }

    async dropTable(ctx:ILoggingContext):Promise<void>{
        var query = `DROP TABLE IF EXISTS ${this._tableName};`;
        var p = this._postgresClient.query({
            text: query,
        });
        return p.then((_: any) => {
            Logger.debug(ctx, `Dropped it (like its hot)`);
        });
    }

    submitBallot(ballot: Ballot, ctx:ILoggingContext, reason:string): Promise<Ballot> {
        Logger.debug(ctx, `${className}.submit`, ballot);
        var sqlString = `INSERT INTO ${this._tableName} (ballot_id,election_id,user_id,status,date_submitted,ip_address,votes,history,precinct)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ballot_id;`;
        Logger.debug(ctx, sqlString);
        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [
                ballot.ballot_id,
                ballot.election_id,
                ballot.user_id,
                ballot.status,
                ballot.date_submitted,
                ballot.ip_address,
                JSON.stringify(ballot.votes),
                JSON.stringify(ballot.history),
                ballot.precinct]
        });

        return p.then((res: any) => {
            Logger.debug(ctx, `set response rows:`, res);
            ballot.ballot_id = res.rows[0][0];
            Logger.state(ctx, `Ballot submitted`, { ballot: ballot, reason: reason});
            return ballot;
        });
    }

    getBallotByID(ballot_id: string, ctx:ILoggingContext): Promise<Ballot | null> {
        Logger.debug(ctx, `${className}.getBallotByID ${ballot_id}`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE ballot_id = $1`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [ballot_id]
        });
        return p.then((response: any) => {
            var rows = response.rows;
            if (rows.length == 0) {
                Logger.debug(ctx, `.get null`);
                return null;
            }
            return rows[0] as Ballot;
        });
    }


    getBallotsByElectionID(election_id: string,  ctx:ILoggingContext): Promise<Ballot[] | null> {
        Logger.debug(ctx, `${className}.getBallotsByElectionID ${election_id}`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id]
        });
        return p.then((response: any) => {
            var rows = response.rows;
            console.log(rows[0])
            if (rows.length == 0) {
                Logger.debug(ctx, `.get null`);
                return [] as Ballot[];
            }
            return rows
        });
    }

    delete(ballot_id: Uid,  ctx:ILoggingContext, reason:string): Promise<boolean> {
        Logger.debug(ctx, `${className}.delete ${ballot_id}`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE ballot_id = $1`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [ballot_id]
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                Logger.state(ctx, `Ballot ${ballot_id} deleted:`, {ballotId: ballot_id, reason: reason });
                return true;
            }
            return false;
        });
    }
}