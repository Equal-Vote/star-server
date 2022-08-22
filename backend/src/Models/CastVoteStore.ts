import { Ballot } from "../../../domain_model/Ballot";
import { ElectionRoll } from "../../../domain_model/ElectionRoll";
import { ILoggingContext } from "../Services/Logging/ILogger";
import Logger from "../Services/Logging/Logger";
var pgFormat = require('pg-format');

export default class CastVoteStore {

    _postgresClient;
    _ballotTableName:string;
    _rollTableName:string;

    constructor(postgresClient:any) {
        this._postgresClient = postgresClient;
        this._ballotTableName = "ballotDB";
        this._rollTableName = "electionRollDB";
    }

    submitBallot(ballot: Ballot, roll:ElectionRoll, ctx:ILoggingContext, reason:String): Promise<Ballot> {

        var ballotValues = [ballot.election_id,
            ballot.user_id,
            ballot.status,
            ballot.date_submitted,
            ballot.ip_address,
            JSON.stringify(ballot.votes),
            JSON.stringify(ballot.history)];

        const ballotSQL = pgFormat(`INSERT INTO ${this._ballotTableName} (election_id,user_id,status,date_submitted,ip_address,votes,history)
        VALUES %L RETURNING ballot_id;`, ballotValues);

        var rollValues = [roll.ballot_id, roll.submitted, roll.state, JSON.stringify(roll.history), JSON.stringify(roll.registration), roll.election_id, roll.voter_id]
        var rollSql = pgFormat(`UPDATE ${this._rollTableName} SET ballot_id=%L, submitted=%L, state=%L, history=%L, registration=%L WHERE election_id = %I AND voter_id=%I`, rollValues);
        Logger.debug(ctx, rollSql);

        const transactionSql = `BEGIN; ${ballotSQL} ${rollSql} COMMIT;`
        Logger.debug(ctx, transactionSql);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: transactionSql
        });

        return p.then((res: any) => {
            Logger.debug(ctx, `set response rows:`, res);
            ballot.ballot_id = res.rows[0][0];
            Logger.state(ctx, `Ballot submitted`, { ballot: ballot, reason: reason});
            return ballot;
        });
    }

}