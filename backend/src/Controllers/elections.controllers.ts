import { Election } from '../../../domain_model/Election';
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
const ElectionsDB = require('../Models/Elections')
import StarResults from '../StarResults.cjs';

const { Pool } = require('pg');
// May need to use this ssl setting when using local database
// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
//     ssl:  false
// });
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
    ssl:  {
        rejectUnauthorized: false
    }
});
var ElectionsModel = new ElectionsDB(pool, "electionDB");
ElectionsModel.init();


const getElectionByID = async (req: any, res: any, next: any) => {
    try {
        const election = await ElectionsModel.getElectionByID(parseInt(req.params.id))
        if (!election)
            return res.status('400').json({
                error: "Election not found"
            })
        console.log(`Getting Election: ${req.params.id}`)
        console.log(election)
        req.election = election
        next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve election"
        })
    }
}

const returnElection = async (req: any, res: any, next: any) => {
    console.log(req.authorized_voter)
    console.log(req.has_voted)

    res.json({election: req.election, voterAuth: {authorized_voter: req.authorized_voter,has_voted: req.has_voted}})
}

const getElectionResults = async (req: any, res: any, next: any) => {

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
    try {
        var filter = (req.query.filter == undefined)? "" : req.query.filter;
        const Elections = await ElectionsModel.getElections(filter);
        if (!Elections)
            return res.status('400').json({
                error: "Elections not found"
            })
        console.log(Elections)
        res.json(Elections)
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve elections"
        })
    }
}

const createElection = async (req: any, res: any, next: any) => {

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
            error: "Could not create election"
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
}