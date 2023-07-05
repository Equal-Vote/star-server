// import { ElectionRoll, ElectionRollAction } from '../../../domain_model/ElectionRoll';
import { ILoggingContext } from '../Services/Logging/ILogger';
import Logger from '../Services/Logging/Logger';
import { IElectionRollStore } from './IElectionRollStore';
var format = require('pg-format');
import { Kysely, SqlBool, SqlBool, sql } from 'kysely'
import { NewElectionRoll, ElectionRoll, UpdatedElectionRoll } from './IElectionRoll';
import { Database } from './Database';
const tableName = 'electionRollDB';

export default class ElectionRollDB implements IElectionRollStore {

    _postgresClient;
    _tableName: string = tableName;

    constructor(postgresClient: Kysely<Database>) {
        this._postgresClient = postgresClient;
        this.init()
    }

    async init(): Promise<ElectionRollDB> {
        var appInitContext = Logger.createContext("appInit");
        Logger.debug(appInitContext, "-> ElectionRollDB.init");
        return this;
    }

    async dropTable(ctx: ILoggingContext): Promise<void> {
        Logger.debug(ctx, `${tableName}.dropTable`);
        return this._postgresClient.schema.dropTable(tableName).execute()
    }

    submitElectionRoll(electionRolls: ElectionRoll[], ctx: ILoggingContext, reason: string): Promise<boolean> {
        Logger.debug(ctx, `${tableName}.submit`);

        var stringifiedRolls: NewElectionRoll[] = electionRolls.map((electionRoll) => (
            stringifyRoll(electionRoll)))

        return this._postgresClient
            .insertInto(tableName)
            .values(stringifiedRolls)
            .execute().then((res) => { return true })
    }

    getRollsByElectionID(election_id: string, ctx: ILoggingContext): Promise<ElectionRoll[] | null> {
        Logger.debug(ctx, `${tableName}.getByElectionID ${election_id}`);

        return this._postgresClient
            .selectFrom(tableName)
            .where('election_id', '=', election_id)
            .selectAll()
            .execute()
    }

    getByVoterID(election_id: string, voter_id: string, ctx: ILoggingContext): Promise<ElectionRoll | null> {
        Logger.debug(ctx, `${tableName}.getByVoterID election:${election_id}, voter:${voter_id}`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1 AND voter_id = $2`;
        Logger.debug(ctx, sqlString);

        return this._postgresClient
            .selectFrom(tableName)
            .where('election_id', '=', election_id)
            .where('voter_id', '=', voter_id)
            .selectAll()
            .executeTakeFirstOrThrow()
            .catch(((reason: any) => {
                Logger.debug(ctx, reason);
                return null
            }))
    }
    getByEmail(email: string, ctx: ILoggingContext): Promise<ElectionRoll[] | null> {
        Logger.debug(ctx, `${tableName}.getByEmail email:${email}`);

        return this._postgresClient
            .selectFrom(tableName)
            .where('email', '=', email)
            .selectAll()
            .execute()
            .catch(((reason: any) => {
                Logger.debug(ctx, reason);
                return null
            }))
    }

    getElectionRoll(election_id: string, voter_id: string | null, email: string | null, ip_address: string | null, ctx: ILoggingContext): Promise<[ElectionRoll] | null> {
        Logger.debug(ctx, `${tableName}.get election:${election_id}, voter:${voter_id}`);
        let sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1 AND ( `;

        let query = this._postgresClient
            .selectFrom(tableName)
            .where(({ or, cmpr }) =>
                or(
                )
            )

        if (voter_id) {
            values.push(voter_id)
            sqlString += `voter_id = $${values.length}`
        }
        if (email) {
            if (voter_id) {
                sqlString += ' OR '
            }
            values.push(email)
            sqlString += `email = $${values.length}`
        }
        if (ip_address) {
            if (voter_id || email) {
                sqlString += ' OR '
            }
            values.push(ip_address)
            sqlString += `ip_address = $${values.length}`
        }


        return query.selectAll()
            .execute()
            .catch(((reason: any) => {
                Logger.debug(ctx, reason);
                return null
            }))

        let values = [election_id]
        if (voter_id) {
            values.push(voter_id)
            sqlString += `voter_id = $${values.length}`
        }
        if (email) {
            if (voter_id) {
                sqlString += ' OR '
            }
            values.push(email)
            sqlString += `email = $${values.length}`
        }
        if (ip_address) {
            if (voter_id || email) {
                sqlString += ' OR '
            }
            values.push(ip_address)
            sqlString += `ip_address = $${values.length}`
        }
        sqlString += ')'
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: values
        });
        return p.then((response: any) => {
            var rows = response.rows;
            Logger.debug(ctx, rows[0])
            if (rows.length == 0) {
                Logger.debug(ctx, ".get null");
                return null;
            }
            return rows
        });
    }

    update(election_roll: ElectionRoll, ctx: ILoggingContext, reason: string): Promise<ElectionRoll | null> {
        Logger.debug(ctx, `${tableName}.updateRoll`);
        var sqlString = `UPDATE ${this._tableName} SET ballot_id=$1, submitted=$2, state=$3, history=$4, registration=$5, email_data=$6 WHERE election_id = $7 AND voter_id=$8`;
        Logger.debug(ctx, sqlString);
        Logger.debug(ctx, "", election_roll)
        var p = this._postgresClient.query({
            text: sqlString,

            values: [election_roll.ballot_id, election_roll.submitted, election_roll.state, JSON.stringify(election_roll.history), JSON.stringify(election_roll.registration), JSON.stringify(election_roll.email_data), election_roll.election_id, election_roll.voter_id]

        });
        return p.then((response: any) => {
            var rows = response.rows;
            Logger.debug(ctx, "", response);
            if (rows.length == 0) {
                Logger.debug(ctx, ".get null");
                return [] as ElectionRoll[];
            }
            const newElectionRoll = rows;
            Logger.state(ctx, `Update Election Roll: `, { reason: reason, electionRoll: newElectionRoll });
            return newElectionRoll;
        });
    }

    delete(election_roll: ElectionRoll, ctx: ILoggingContext, reason: string): Promise<boolean> {
        Logger.debug(ctx, `${tableName}.delete`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE election_id = $1 AND voter_id=$2`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [election_roll.election_id, election_roll.voter_id]
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                Logger.state(ctx, `Delete ElectionRoll`, { reason: reason, electionId: election_roll.election_id });
                return true;
            }
            return false;
        });
    }
}

function stringifyRoll(electionRoll: ElectionRoll) {
    return {
        ...electionRoll,
        history: JSON.stringify(electionRoll.history),
        registration: JSON.stringify(electionRoll.registration),
        email_data: JSON.stringify(electionRoll.email_data)
    }
}