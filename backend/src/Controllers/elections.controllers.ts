import { Election } from '../../../domain_model/Election';
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
const ElectionsDB = require('../Models/Elections')
import StarResults from '../StarResults.cjs';

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
    ssl: false
});
var ElectionsModel = new ElectionsDB(pool, "electionDB");
ElectionsModel.init();


const electionByID = async (req: any, res: any, next: any) => {
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

const getElection = async (req: any, res: any, next: any) => {
    res.json(req.election)
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

const getElections = async (req: any, res: any, next: any) => {

    try {
        const Elections = await ElectionsModel.getElections()
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
    } catch (err) {
        return res.status('400').json({
            error: "Could not create election"
        })
    }
}

module.exports = {
    getElection,
    getElectionResults,
    getElections,
    createElection,
    electionByID
}