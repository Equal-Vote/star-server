import { Ballot } from "../../../../domain_model/Ballot";
import { ElectionRoll } from "../../../../domain_model/ElectionRoll";
import { ILoggingContext } from "../../Services/Logging/ILogger";
import { IBallotStore } from "../IBallotStore";
import { IElectionRollStore } from "../IElectionRollStore";

export default class CastVoteStore {

    _ballotStore:IBallotStore;
    _rollStore:IElectionRollStore;

    constructor(ballotStore:IBallotStore, rollStore:IElectionRollStore) {
        this._ballotStore = ballotStore;
        this._rollStore = rollStore;
    }

    async submitBallot(ballot: Ballot, roll:ElectionRoll, ctx:ILoggingContext, reason:string): Promise<Ballot> {

        const savedBallot = await this._ballotStore.submitBallot(ballot, ctx, reason);
        await this._rollStore.update(roll, ctx, reason);
        return savedBallot;
    }

}