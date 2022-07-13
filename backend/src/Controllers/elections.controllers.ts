import { Election } from '../../../domain_model/Election';
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
const ElectionsDB = require('../Models/Elections')
const StarResults = require('../Tabulators/StarResults.js');

var ElectionsModel = new ElectionsDB(ServiceLocator.postgres());
const className="Elections.Controllers";

const getElectionByID = async (req: any, res: any, next: any) => {
    Logger.info(req, `${__filename}.getElectionByID ${req.params.id}`);
    try {
        var election = await ElectionsModel.getElectionByID(parseInt(req.params.id))
        Logger.debug(req, `get election ${req.params.id}`);
        var failMsg = "Election not found";
        if (!election) {
            Logger.info(req, `${failMsg} electionId=${req.params.id}}`);
            return responseErr(res, req, 400, failMsg);
        }
        // Update Election State
        const currentTime = new Date();
        var stateChange = false
        if (election.state === 'draft') {

        }
        if (election.state === 'finalized') {
            var openElection = false;
            if (election.start_time) {
                const startTime = new Date(election.start_time);
                if (currentTime.getTime() > startTime.getTime()) {
                    openElection = true;
                }
            } else {
                openElection = true;
            }
            if (openElection){
                Logger.info(req, `Election Transitioning to Open From ${election.state} (start time = ${election.start_time})`);
                stateChange = true;
                election.state = 'open';
            }
        }
        if (election.state === 'open') {
            if (election.end_time) {
                const endTime = new Date(election.end_time);
                if (currentTime.getTime() > endTime.getTime()) {
                    Logger.info(req, `Election Transitioning to Closed From ${election.state} (end time = ${election.end_time})`)
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
    } catch (err:any) {
        var failMsg = "Could not retrieve election";
        Logger.error(req, `${failMsg} ${err.message}`);
        return responseErr(res, req, 500, failMsg);
    }
}

const returnElection = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.returnElection ${req.params.id}`)
    res.json({ election: req.election, voterAuth: { authorized_voter: req.authorized_voter, has_voted: req.has_voted } })
}

const getElectionResults = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.getElectionResults: ${req.params.id}`);

    const ballots = req.ballots
    const election = req.election
    const candidateNames = election.races[0].candidates.map((Candidate: any) => (Candidate.candidate_name))
    Logger.debug(req, "Candidate names: " + JSON.stringify(candidateNames));
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
    Logger.info(req, `${className}.getSandboxResults`);
    try {
        const candidateNames = req.body.candidates;
        const cvr = req.body.cvr;
        const num_winners = req.body.num_winners;
        Logger.debug(req, "Candidate names:  "+JSON.stringify(candidateNames));
        const results = StarResults(candidateNames, cvr, num_winners)
        res.json(
            {
                Results: results
            }
        );
    } catch (err:any) {
        Logger.error(req, `${className}.getSandboxResults error: ${err.message}.`);
        return responseErr(res, req, 500, "Error calculating results");
    }
}

const getElections = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.getElections`);
    var failMsg = "Could not retrieve elections";
    try {
        var filter = (req.query.filter == undefined) ? "" : req.query.filter;
        const Elections = await ElectionsModel.getElections(filter);
        if (!Elections){
            var msg = "Election does not exist";
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        res.json(Elections);
    } catch (err:any) {
        Logger.error(req, failMsg+". "+err.message);
        return responseErr(res, req, 500, failMsg);
    }
}

const createElection = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.createElection`)
    var failMsg = "Election not created";

    try {
        const newElection = await ElectionsModel.createElection(req.body.Election)
        if (!newElection){
            Logger.error(req, failMsg);
            return responseErr(res, req, 400, failMsg);
        }
        req.election = newElection;
        return next();
    } catch (err:any) {
        Logger.error(req, failMsg+". "+err.message);
        return responseErr(res, req, 500, failMsg);
    }
}

const deleteElection = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.deleteElection`)
    var failMsg = "Election not deleted";
    try {
        const success = await ElectionsModel.delete(req.election.election_id);
        if (!success){
            var msg = "Nothing to delete";
            Logger.error(req, msg);
            return responseErr(res, req, 400, msg);
        }
        return next();
    } catch (err:any) {
        Logger.error(req, failMsg + ". " + err.message);
        return responseErr(res, req, 500, failMsg);
    }
}

const editElection = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.editElection`)
    if (req.body.Election == undefined) {
        Logger.info(req, `Election undefined`);
        return responseErr(res, req, 400, "Election not provided");
    }
    if (req.election.state !== 'draft') {
        Logger.info(req, `Election is not editable, state=${req.election.state}`);
        return responseErr(res, req, 400, "Election is not editable");
    }
    if (req.election.election_id != req.params.id){
        Logger.info(req, `Body Election ${req.election.election_id} != param ID ${req.params.id}`);
        return responseErr(res, req, 400, "Election ID must match the URL Param");
    }
    Logger.debug(req, `election ID = ${req.body.Election.election_id}`);
    var failMsg = `Failed to update election`;
    try {
        const updatedElection = await ElectionsModel.updateElection(req.body.Election)
        if (!updatedElection){
            Logger.error(req, failMsg);
            return responseErr(res, req, 400, failMsg);
        }
        req.election = updatedElection
        Logger.debug(req, `editElection succeeds for ${updatedElection.election_id}`);
        return next()
    } catch (err:any) {
        Logger.error(req, `${failMsg}: ${err.message}`);
        return responseErr(res, req, 500, failMsg);
    }
}

const finalize = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.finalize ${req.election.election_id}`);
    if (req.election.state !== 'draft') {
        var msg = "Election already finalized";
        Logger.info(req, msg);
        return responseErr(res, req, 400, msg);
    }
    var failMsg = "Failed to update Election";
    try {
        req.election.state = 'finalized'
        const updatedElection = await ElectionsModel.updateElection(req.election)
        if (!updatedElection) {
            Logger.info(req, failMsg);
            return responseErr(res, req, 400, failMsg);
        }
        req.election = updatedElection
        next()
    } catch (err:any) {
        Logger.error(req, failMsg +". "+err.message);
        return responseErr(res, req, 500, failMsg); 
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