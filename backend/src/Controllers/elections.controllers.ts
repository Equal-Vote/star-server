import { Election } from '../../../domain_model/Election';
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
const ElectionsDB = require('../Models/Elections')
const StarResults = require('../StarResults.js');

var ElectionsModel = new ElectionsDB();

const getElectionByID = async (req: any, res: any, next: any) => {
    console.log(`-> elections.getElectionByID ${req.params.id}`)
    try {
        const election = await ElectionsModel.getElectionByID(parseInt(req.params.id))
        console.log(`get election ${req.params.id}`)
        if (!election){
            console.log('Error')
            return res.status('400').json({
                error: "Election not found"
            })
        }
        req.election = election
        next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve election"
        })
    }
}

const returnElection = async (req: any, res: any, next: any) => {
    console.log(`-> elections.returnElection ${req.params.id}`)
    res.json({election: req.election, voterAuth: {authorized_voter: req.authorized_voter,has_voted: req.has_voted}})
}

const getElectionResults = async (req: any, res: any, next: any) => {
    console.log(`-> elections.getElectionResults ${req.params.id}`)

    const ballots = req.ballots
    const election = req.election
    const candidateNames = election.races[0].candidates.map((Candidate: any) => (Candidate.candidate_name))
    console.log(candidateNames)
    const cvr = ballots.map((ballot: Ballot) => (
        ballot.votes[0].scores.map((score: Score) => (
            score.score
        ))
    ))
    const num_winners = election.races[0].num_winners
    const results = StarResults(candidateNames, cvr, num_winners)

    res.json(
        {
            Election: election,
            Results: results
        }
    )

}
const getSandboxResults = async (req: any, res: any, next: any) => {
    console.log(`-> elections.getSandboxResults`)

    const candidateNames = req.body.candidates
    const cvr = req.body.cvr
    const num_winners = req.body.num_winners
    console.log(candidateNames)
    const results = StarResults(candidateNames, cvr, num_winners)

    res.json(
        {
            Results: results
        }
    )

}

const getElections = async (req: any, res: any, next: any) => {
    console.log(`-> elections.getElections`)
    try {
        var filter = (req.query.filter == undefined)? "" : req.query.filter;
        const Elections = await ElectionsModel.getElections(filter);
        if (!Elections)
            return res.status('400').json({
                error: "Elections not found"
            })
        res.json(Elections)
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve elections"
        })
    }
}

const createElection = async (req: any, res: any, next: any) => {
    console.log(`-> elections.createElection`)
    try {
        const newElection = await ElectionsModel.createElection(req.body.Election)
        if (!newElection)
            return res.status('400').json({
                error: "Election not found"
            })
        req.election = newElection
        next()
    } catch (err) {
        return res.status('400').json({
            error: (err as any).message
        })
    }
}

const editElection = async (req: any, res: any, next: any) => {
    if(req.body.Election == undefined){
        return res.status('400').json({
            error: "Election not provided"
        })
    }
    console.log(`-> elections.editElection ${req.body.Election.election_id}`)

    try {
        const updatedElection = await ElectionsModel.updateElection(req.body.Election)
        if (!updatedElection)
            return res.status('400').json({
                error: "Failed to update Election"
            })
        req.election = updatedElection
        next()
    } catch (err) {
        return res.status('400').json({
            error: (err as any).message
        })
    }
}

module.exports = {
    returnElection,
    getElectionResults,
    getElections,
    createElection,
    getElectionByID,
    getSandboxResults,
    editElection,
}