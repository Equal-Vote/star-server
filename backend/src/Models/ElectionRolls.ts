import { ILoggingContext } from '../Services/Logging/ILogger';
import Logger from '../Services/Logging/Logger';
import { IElectionRollStore } from './IElectionRollStore';
import { Expression, Kysely } from 'kysely'
import { Database } from './Database';
import { ElectionRoll } from '../../../domain_model/ElectionRoll';
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

        return this._postgresClient
            .insertInto(tableName)
            .values(electionRolls)
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

    getElectionRoll(election_id: string, voter_id: string | null, email: string | null, ip_address: string | null, ctx: ILoggingContext): Promise<ElectionRoll[] | null> {
        Logger.debug(ctx, `${tableName}.get election:${election_id}, voter:${voter_id}`);

        return this._postgresClient
            .selectFrom(tableName)
            .where('election_id', '=', election_id)
            .where((eb) => {
                const ors: Expression<boolean>[] = []

                if (voter_id) {
                    ors.push(eb.cmpr('voter_id', '=', voter_id))
                }

                if (email) {
                    ors.push(eb.cmpr('email', '=', email))
                }

                if (ip_address) {
                    ors.push(eb.cmpr('ip_address', '=', ip_address))
                }

                return eb.or(ors)
            })
            .selectAll()
            .execute()
            .then((rolls) => {
                if (rolls.length == 0) return null
                return rolls
            })
            .catch(((reason: any) => {
                console.log('aaaaahhhhhh')
                Logger.debug(ctx, reason);
                return null
            }))
    }

    update(election_roll: ElectionRoll, ctx: ILoggingContext, reason: string): Promise<ElectionRoll | null> {
        Logger.debug(ctx, `${tableName}.updateRoll`);
        Logger.debug(ctx, "", election_roll)

        return this._postgresClient
            .updateTable(tableName)
            .where('election_id', '=', election_roll.election_id)
            .where('voter_id', '=', election_roll.voter_id)
            .set(election_roll)
            .returningAll()
            .executeTakeFirstOrThrow()
            .catch((reason: any) => {
                Logger.debug(ctx, ".get null");
                return null;
            })
    }

    delete(election_roll: ElectionRoll, ctx: ILoggingContext, reason: string): Promise<boolean> {
        Logger.debug(ctx, `${tableName}.delete`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE election_id = $1 AND voter_id=$2`;
        Logger.debug(ctx, sqlString);
        let deletedRoll = this._postgresClient
            .deleteFrom(tableName)
            .where('election_id', '=', election_roll.election_id)
            .where('voter_id', '=', election_roll.voter_id)
            .returningAll()
            .execute()

        return deletedRoll.then((roll) => {
            if (roll) {
                return true
            } else {
                return false
            }
        })
    }
}