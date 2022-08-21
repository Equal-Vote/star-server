import { Ballot } from "../../../../domain_model/Ballot";
import { Uid } from "../../../../domain_model/Uid";
import { ILoggingContext } from "../../Services/Logging/ILogger";
import { IBallotStore } from "../IBallotStore";

export default class BallotsDB implements IBallotStore {
    ballots: Ballot[] = [];

    constructor() {}
    submitBallot(ballot: Ballot, ctx:ILoggingContext, reason:string): Promise<Ballot> {
        var copy = JSON.parse(JSON.stringify(ballot));
        this.ballots.push(copy);
        return Promise.resolve(JSON.parse(JSON.stringify(copy)));
    }
    getBallotsByElectionID(election_id: string, ctx:ILoggingContext): Promise<Ballot[] | null> {
        const ballots = this.ballots.filter(
            (ballot) => ballot.election_id === election_id
        );
        if (!ballots) {
            return Promise.resolve(null);
        }
        var resBallots = JSON.parse(JSON.stringify(ballots));
        return Promise.resolve(resBallots);
    }

    getBallotByID(ballot_id: string, ctx:ILoggingContext): Promise<Ballot | null> {
        const ballots = this.ballots.filter(
            (ballot) => ballot.ballot_id === ballot_id
        );
        if (!ballots) {
            return Promise.resolve(null);
        }
        var resBallots = JSON.parse(JSON.stringify(ballots));
        return Promise.resolve(resBallots);
    }

    delete(ballot_id: Uid, ctx:ILoggingContext): Promise<boolean> {
        const ballot = this.ballots.find(
            (ballot) => ballot.ballot_id === ballot_id
        );
        if (!ballot) {
            return Promise.resolve(false);
        }
        this.ballots = this.ballots.filter(
            (ballot) => ballot.ballot_id != ballot_id
        );
        return Promise.resolve(true);
    }
}
