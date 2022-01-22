import { Ballot } from '../../../domain_model/Ballot';
// Temporary in memory storage of ballot data
const Ballots = new Array() as Ballot[];

function submitBallot(Ballot:Ballot){
    console.log('Ballot Submitted')
    Ballots.push(Ballot)
    console.log(Ballots)
}

function getBallotsByElectionID(electionID:number) {
    const ballots = Ballots.filter(Ballot  => parseInt(Ballot.votes[0].pollId) === electionID );
    return ballots
}

module.exports = {
    submitBallot,
    getBallotsByElectionID
}