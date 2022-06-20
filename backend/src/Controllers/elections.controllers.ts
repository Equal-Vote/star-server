import { Election } from '../../../domain_model/Election';
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
const ElectionsDB = require('../Models/Elections')
const StarResults = require('../Tabulators/StarResults.js');

var ElectionsModel = new ElectionsDB();

const getElectionByID = async (req: any, res: any, next: any) => {
    console.log(`-> elections.getElectionByID ${req.params.id}`)
    try {
        var election = await ElectionsModel.getElectionByID(parseInt(req.params.id))
        console.log(`get election ${req.params.id}`)
        if (!election) {
            console.log('Error')
            return res.status('400').json({
                error: "Election not found"
            })
        }
        // Update Election State
        const currentTime = new Date();
        var stateChange = false
        if (election.state === 'draft') {

        }
        if (election.state === 'finalized') {
            if (election.start_time) {
                const startTime = new Date(election.start_time);
                if (currentTime.getTime() > startTime.getTime()) {
                    console.log(`-> Election Transitioning To Open From ${election.state}`)
                    stateChange = true;
                    election.state = 'open';
                }
            } else {
                console.log(`-> Election Transitioning To Open From ${election.state}`)
                stateChange = true;
                election.state = 'open';
            }
        }
        if (election.state === 'open') {
            if (election.end_time) {
                const endTime = new Date(election.end_time);
                if (currentTime.getTime() > endTime.getTime()) {
                    console.log(`-> Election Transitioning To Closed From ${election.state}`)
                    stateChange = true;
                    election.state = 'closed';
                }
            }
        }
        if (stateChange) {
            election = await ElectionsModel.updateElection(election)
        }
        req.election = election
        return next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve election"
        })
    }
}

const returnElection = async (req: any, res: any, next: any) => {
    console.log(`-> elections.returnElection ${req.params.id}`)
    res.json({ election: req.election, voterAuth: { authorized_voter: req.authorized_voter, has_voted: req.has_voted } })
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
    try {
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
    } catch (err) {
        return res.status('400').json({
            error: "Error calculating results"
        })
    }
}

const getElections = async (req: any, res: any, next: any) => {
    console.log(`-> elections.getElections`)
    try {
        var filter = (req.query.filter == undefined) ? "" : req.query.filter;
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
        return next()
    } catch (err) {
        return res.status('400').json({
            error: (err as any).message
        })
    }
}

const deleteElection = async (req: any, res: any, next: any) => {
    console.log(`-> elections.deleteElection`)
    try {
        const success = await ElectionsModel.delete(req.election.election_id)
        if (!success)
            return res.status('400').json({
                error: "Election not deleted"
            })
        return next()
    } catch (err) {
        return res.status('400').json({
            error: (err as any).message
        })
    }
}

const editElection = async (req: any, res: any, next: any) => {
    if (req.body.Election == undefined) {
        return res.status('400').json({
            error: "Election not provided"
        })
    }
    if (req.election.state !== 'draft') {
        console.log(`--> Failed to Edit while in ${req.election.state}`)
        return res.status('400').json({
            error: "Election is not editable"
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
        return next()
    } catch (err) {
        return res.status('400').json({
            error: (err as any).message
        })
    }
}

const finalize = async (req: any, res: any, next: any) => {
    if (req.election.state !== 'draft') {
        console.log(`-> Already Finalized`)
        return res.status('400').json({
            error: "Election already finalized"
        })
    }
    console.log(`-> elections.finalize ${req.election.election_id}`)

    try {
        req.election.state = 'finalized'
        const updatedElection = await ElectionsModel.updateElection(req.election)
        if (!updatedElection)
            return res.status('400').json({
                error: "Failed to update Election"
            })
        req.election = updatedElection
        // return  res.json({election: updatedElection})
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
    deleteElection,
    getElectionByID,
    getSandboxResults,
    editElection,
    finalize,
}