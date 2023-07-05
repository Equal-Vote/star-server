import { Ballot } from '../../../domain_model/Ballot';
import { Uid } from '../../../domain_model/Uid';
import { ILoggingContext } from '../Services/Logging/ILogger';
import Logger from '../Services/Logging/Logger';
import { IBallotStore } from './IBallotStore';
import { Kysely, sql } from 'kysely';
import { Database } from './Database';
import { InternalServerError } from '@curveball/http-errors';

const tableName = 'ballotDB';

export default class BallotsDB implements IBallotStore {
    _postgresClient;
    _tableName: string = tableName;

    constructor(postgresClient: Kysely<Database>) {
        this._postgresClient = postgresClient;
        this.init()
    }

    async init(): Promise<IBallotStore> {
        var appInitContext = Logger.createContext("appInit");
        Logger.debug(appInitContext, "BallotsDB.init");
        return this;
    }

    async dropTable(ctx: ILoggingContext): Promise<void> {
        Logger.debug(ctx, `${tableName}.dropTable`);
        return this._postgresClient.schema.dropTable(tableName).execute()
    }

    submitBallot(ballot: Ballot, ctx: ILoggingContext, reason: string): Promise<Ballot> {
        Logger.debug(ctx, `${tableName}.submit`, ballot);

        return this._postgresClient
            .insertInto(tableName)
            .values(ballot)
            .returningAll()
            .executeTakeFirstOrThrow()
            .then((ballot) => {
                Logger.state(ctx, `Ballot submitted`, { ballot: ballot, reason: reason });
                return ballot;
            });
    }

    getBallotByID(ballot_id: string, ctx: ILoggingContext): Promise<Ballot | null> {
        Logger.debug(ctx, `${tableName}.getBallotByID ${ballot_id}`);

        return this._postgresClient
            .selectFrom(tableName)
            .selectAll()
            .where('ballot_id', '=', ballot_id)
            .executeTakeFirstOrThrow()
            .catch((reason: any) => {
                Logger.debug(ctx, `${tableName}.get null`, reason);
                return null;
            })
    }


    getBallotsByElectionID(election_id: string, ctx: ILoggingContext): Promise<Ballot[] | null> {
        Logger.debug(ctx, `${tableName}.getBallotsByElectionID ${election_id}`);

        return this._postgresClient
            .selectFrom(tableName)
            .selectAll()
            .where('election_id', '=', election_id)
            .execute()
    }

    delete(ballot_id: Uid, ctx: ILoggingContext, reason: string): Promise<boolean> {
        Logger.debug(ctx, `${tableName}.delete ${ballot_id}`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE ballot_id = $1`;
        Logger.debug(ctx, sqlString);

        return this._postgresClient
            .deleteFrom(tableName)
            .where('ballot_id', '=', ballot_id)
            .returningAll()
            .executeTakeFirst()
            .then((ballot) => {
                if (ballot) {
                    return true
                } else {
                    return false
                }
            })
    }
}