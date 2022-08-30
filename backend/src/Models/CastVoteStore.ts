import { Ballot } from "../../../domain_model/Ballot";
import { ElectionRoll } from "../../../domain_model/ElectionRoll";
import { ILoggingContext } from "../Services/Logging/ILogger";
import Logger from "../Services/Logging/Logger";
var pgFormat = require("pg-format");

export default class CastVoteStore {
    _postgresClient;
    _ballotTableName: string;
    _rollTableName: string;

    constructor(postgresClient: any) {
        this._postgresClient = postgresClient;
        this._ballotTableName = "ballotDB";
        this._rollTableName = "electionRollDB";
    }

    submitBallot(
        ballot: Ballot,
        roll: ElectionRoll,
        ctx: ILoggingContext,
        reason: String
    ): Promise<Ballot> {
        var ballotValues = [
            ballot.ballot_id,
            ballot.election_id,
            ballot.user_id,
            ballot.status,
            ballot.date_submitted,
            ballot.ip_address,
            JSON.stringify(ballot.votes),
            JSON.stringify(ballot.history),
        ];

        const ballotSQL = pgFormat(
            `INSERT INTO ${this._ballotTableName} (ballot_id,election_id,user_id,status,date_submitted,ip_address,votes,history)
        VALUES (%L);`,
            ballotValues
        );

        var rollSql = pgFormat(
            `UPDATE ${this._rollTableName} SET ballot_id=%L, submitted=%L, state=%L, history=%L, registration=%L WHERE election_id=%L AND voter_id=%L;`,
            roll.ballot_id,
            roll.submitted,
            roll.state,
            JSON.stringify(roll.history),
            JSON.stringify(roll.registration),
            roll.election_id,
            roll.voter_id,
        );
        Logger.debug(ctx, rollSql);

        const transactionSql = `BEGIN; ${ballotSQL} ${rollSql} COMMIT;`;
        Logger.debug(ctx, transactionSql);

        var p = this._postgresClient.query({
            rowMode: "array",
            text: transactionSql,
        });

        return p.then((res: any) => {
            Logger.state(ctx, `Ballot submitted`, {
                ballot: ballot,
                roll: roll,
                reason: reason,
            });
            return ballot;
        });
    }
}
