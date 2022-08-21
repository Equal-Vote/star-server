import { ElectionRoll, ElectionRollAction } from '../../../domain_model/ElectionRoll';
import { ILoggingContext } from '../Services/Logging/ILogger';
import Logger from '../Services/Logging/Logger';
import { IElectionRollStore } from './IElectionRollStore';
var format = require('pg-format');

export default class ElectionRollDB implements IElectionRollStore{

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
            election_id     VARCHAR NOT NULL,
            voter_id        VARCHAR NOT NULL,
            ballot_id       VARCHAR,
            submitted       BOOLEAN,
            PRIMARY KEY(election_id,voter_id),
            state           VARCHAR NOT NULL,
            history         json,
            registration    json
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
    
    submitElectionRoll(electionRolls: ElectionRoll[], ctx:ILoggingContext,reason:string): Promise<boolean> {
        Logger.debug(ctx, `ElectionRollDB.submit`);
        var values = electionRolls.map((electionRoll) => ([
            electionRoll.election_id,
            electionRoll.voter_id,
            electionRoll.submitted,
            electionRoll.state,
            JSON.stringify(electionRoll.history),
            JSON.stringify(electionRoll.registration)]))
        var sqlString = format(`INSERT INTO ${this._tableName} (election_id,voter_id,submitted,state,history,registration)
        VALUES %L;`, values);
        Logger.debug(ctx, sqlString)
        Logger.debug(ctx, values)
        var p = this._postgresClient.query(sqlString);
        return p.then((res: any) => {
            const resElectionRoll = res.rows[0];
            Logger.state(ctx, `Submit Election Roll: `, {reason: reason, electionRoll: resElectionRoll});
            return resElectionRoll;
        });
    }

    getRollsByElectionID(election_id: string, ctx:ILoggingContext): Promise<ElectionRoll[] | null> {
        Logger.debug(ctx, `ElectionRollDB.getByElectionID`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id]
        });
        return p.then((response: any) => {
            const resRolls = response.rows;
            Logger.debug(ctx, "", resRolls);
            if (resRolls.length == 0) {
                Logger.debug(ctx, ".get null");
                return [];
            }
            return resRolls
        });
    }

    getByVoterID(election_id: string, voter_id: string, ctx:ILoggingContext): Promise<ElectionRoll | null> {
        Logger.debug(ctx, `ElectionRollDB.getByVoterID`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1 AND voter_id = $2`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id, voter_id]
        });
        return p.then((response: any) => {
            var rows = response.rows;
            Logger.debug(ctx, rows[0])
            if (rows.length == 0) {
                Logger.debug(ctx, ".get null");
                return null;
            }
            return rows[0]
        });
    }

    update(election_roll: ElectionRoll, ctx:ILoggingContext, reason:string): Promise<ElectionRoll | null> {
        Logger.debug(ctx, `ElectionRollDB.updateRoll`);
        var sqlString = `UPDATE ${this._tableName} SET ballot_id=$1, submitted=$2, state=$3, history=$4, registration=$5 WHERE election_id = $6 AND voter_id=$7`;
        Logger.debug(ctx, sqlString);
        Logger.debug(ctx, "", election_roll)
        var p = this._postgresClient.query({
            text: sqlString,

            values: [election_roll.ballot_id, election_roll.submitted, election_roll.state, JSON.stringify(election_roll.history), JSON.stringify(election_roll.registration), election_roll.election_id, election_roll.voter_id]

        });
        return p.then((response: any) => {
            var rows = response.rows;
            Logger.debug(ctx, "", response);
            if (rows.length == 0) {
                Logger.debug(ctx, ".get null");
                return [] as ElectionRoll[];
            }
            const newElectionRoll = rows;
            Logger.state(ctx, `Update Election Roll: `, {reason: reason, electionRoll:newElectionRoll });
            return newElectionRoll;
        });
    }

    delete(election_roll: ElectionRoll, ctx:ILoggingContext, reason:string): Promise<boolean> {
        Logger.debug(ctx, `ElectionRollDB.delete`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE election_id = $1 AND voter_id=$2`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [election_roll.election_id, election_roll.voter_id]
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                Logger.state(ctx, `Delete ElectionRoll`, {reason:reason, electionId: election_roll.election_id});
                return true;
            }
            return false;
        });
    }
}