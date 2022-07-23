import { Ballot } from '../../../../domain_model/Ballot';

export default class BallotsDB {

    ballots: Ballot[] = [];
    nextId = 0;

    constructor() {
    }
    submitBallot(ballot: Ballot): Promise<Ballot>{
        var copy = JSON.parse(JSON.stringify(ballot));
        copy.ballot_id = this.nextId;
        this.nextId++;
        this.ballots.push(copy)
        return Promise.resolve(JSON.parse(JSON.stringify(copy)));
    }
    getBallotsByElectionID(election_id:string): Promise<Ballot[] | null> {
        const ballots = this.ballots.filter(ballot => ballot.election_id===election_id)
        if (!ballots){
            return Promise.resolve(null)
        }
        var resBallots = JSON.parse(JSON.stringify(ballots));
        return Promise.resolve(resBallots)
    }
    delete(ballot_id: number): Promise<Ballot | null> {
        const ballot = this.ballots.find(ballot => ballot.ballot_id===ballot_id)
        if (!ballot){
            return Promise.resolve(null)
        }
        this.ballots = this.ballots.filter(ballot => ballot.ballot_id!=ballot_id)
        return Promise.resolve(ballot)
    }
}