import { Ballot } from '@equal-vote/star-vote-shared/domain_model/Ballot';
import { Uid } from '@equal-vote/star-vote-shared/domain_model/Uid';
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
        Logger.debug(ctx, `${tableName}.submit`) // removed ballot to make logging less noisy
        return this.makeSubmitBallotsQuery(ballot, ctx, reason) as Promise<Ballot>
    }

    bulkSubmitBallots(ballots: Ballot[], ctx: ILoggingContext, reason: string): Promise<Ballot[]> {
        Logger.debug(ctx, `${tableName}.bulkSubmit`) // removed ballot to make logging less noisy
        return this.makeSubmitBallotsQuery(ballots, ctx, reason) as Promise<Ballot[]>
    }

    private makeSubmitBallotsQuery(inputBallots: Ballot | Ballot[], ctx: ILoggingContext, reason: string): Promise<Ballot[] | Ballot> {
        let ballots = Array.isArray(inputBallots)? inputBallots : [inputBallots];

        ballots.forEach(b => {
            b.update_date = Date.now().toString()// Use now() because it doesn't change with time zone 
            b.head = true
            b.create_date = new Date().toISOString()
        })

        let query = this._postgresClient
            .insertInto(tableName)
            .values(ballots)
            .returningAll()

        if(ballots.length == 1){
            return query.executeTakeFirstOrThrow()
        }else{
            return query.execute()
        }
    }


    getBallotByID(ballot_id: string, ctx: ILoggingContext): Promise<Ballot | null> {
        Logger.debug(ctx, `${tableName}.getBallotByID ${ballot_id}`);

        return this._postgresClient
            .selectFrom(tableName)
            .selectAll()
            .where('ballot_id', '=', ballot_id)
            .where('head', '=', true)
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
            .where('head', '=', true)
            .execute()
    }

    deleteAllBallotsForElectionID(election_id: string, ctx: ILoggingContext): Promise<boolean> {
        Logger.debug(ctx, `${tableName}.deleteAllBallotsForElectionID ${election_id}`);

        return this._postgresClient
            .deleteFrom(tableName)
            .where('election_id', '=', election_id)
            .returningAll()
            .execute()
            .then(() => true)
            .catch(() => false);
    }

    delete(ballot_id: Uid, ctx: ILoggingContext, reason: string): Promise<boolean> {
        Logger.debug(ctx, `${tableName}.delete ${ballot_id}`);

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