import { Election } from '../../../domain_model/Election';
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
const ElectionsModel = require('../Models/Elections')
const BallotModel = require('../Models/Ballots')
import StarResults from '../StarResults.cjs';


const getElection = (req:any, res:any, next:any) => {
    console.log('Made it to controller')
    res.json(ElectionsModel.getElectionByID(parseInt(req.params.id)))

}

const getElectionResults = (req:any, res:any, next:any) => {

    const ballots = BallotModel.getBallotsByElectionID(parseInt(req.params.id))
    const election = ElectionsModel.getElectionByID(parseInt(req.params.id))
    const candidateNames = election.polls[0].candidates.map((Candidate:any) =>( Candidate.shortName))
    const cvr = ballots.map((ballot:Ballot) => (
        ballot.votes[0].scores.map((score:Score) =>(
            score.score
        ))
    ))

    const results = StarResults(candidateNames,cvr)

    res.json(
        {
            Election: election,
            Results: results
        }
        )

}

const getElections = (req:any, res:any, next:any) => {

    console.log('Made it to controller')
    const Elections = ElectionsModel.getElections()
    res.json(Elections)

}

const createElection = (req:any, res:any, next:any) => {

    const newElection = ElectionsModel.createElection(req.body.Election)

}

const submitBallot = (req:any, res:any, next:any) => {

    const Ballot = BallotModel.submitBallot(req.body)

}

module.exports = {
    getElection,
    getElectionResults,
    getElections,
    createElection,
    submitBallot
}