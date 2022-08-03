import { Election, electionValidation } from '../../../domain_model/Election';
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
import { IRequest } from '../IRequest';


const StarResults = require('../Tabulators/StarResults.js');

var ElectionsModel =  ServiceLocator.electionsDb();
const className="Elections.Controllers";

const getElectionByID = async (req: any, res: any, next: any) => {
    Logger.info(req, `${__filename}.getElectionByID ${req.params.id}`);
    try {
        var election = await ElectionsModel.getElectionByID(req.params.id, req);
        Logger.debug(req, `get election ${req.params.id}`);
        var failMsg = "Election not found";
        if (!election) {
            Logger.info(req, `${failMsg} electionId=${req.params.id}}`);
            return responseErr(res, req, 400, failMsg);
        }
        // Update Election State
        election = await updateElectionStateIfNeeded(req, election);

        req.election = election
        return next()
    } catch (err:any) {
        var failMsg = "Could not retrieve election";
        Logger.error(req, `${failMsg} ${err.message}`);
        return responseErr(res, req, 500, failMsg);
    }
}

async function updateElectionStateIfNeeded(req:IRequest, election:Election):Promise<Election> {
    if (election.state === 'draft') {
        return election;
    }

    const currentTime = new Date();
    var stateChange = false;
    var stateChangeMsg = "";

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
            stateChange = true;
            election.state = 'open';
            stateChangeMsg = `Election ${election.election_id} Transitioning to Open From ${election.state} (start time = ${election.start_time})`;
        }
    }
    if (election.state === 'open') {
        if (election.end_time) {
            const endTime = new Date(election.end_time);
            if (currentTime.getTime() > endTime.getTime()) {
                stateChange = true;
                election.state = 'closed';
                stateChangeMsg = `Election ${election.election_id} transitioning to Closed From ${election.state} (end time = ${election.end_time})`;
            }
        }
    }
    if (stateChange) {
        election = await ElectionsModel.updateElection(election, req, stateChangeMsg);
        Logger.info(req, stateChangeMsg);
    }
    return election;
}

const returnElection = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.returnElection ${req.params.id}`)
    res.json({ election: req.election, voterAuth: { authorized_voter: req.authorized_voter, has_voted: req.has_voted, roles: req.user_auth.roles} })
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
        const Elections = await ElectionsModel.getElections(filter, req);
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
    const inputElection = req.body.Election;
    const validationErr = electionValidation(inputElection);
    if (validationErr){
        Logger.info(req, "=Invalid Election: "+ validationErr, inputElection);
        return responseErr(res, req, 400, "Invalid Election");
    }
    try {
        const newElection = await ElectionsModel.createElection(req.body.Election, req, `User Creates new election`);
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

const editElection = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.editElection`)

    const inputElection = req.body.Election;
    const validationErr = electionValidation(inputElection);
    if (validationErr){
        Logger.info(req, "Invalid Election: "+ validationErr);
        return responseErr(res, req, 400, "Invalid Election");
    }

    if (inputElection.state !== 'draft') {
        Logger.info(req, `Election is not editable, state=${inputElection.state}`);
        return responseErr(res, req, 400, "Election is not editable");
    }
    if (inputElection.election_id != req.params.id){
        Logger.info(req, `Body Election ${inputElection.election_id} != param ID ${req.params.id}`);
        return responseErr(res, req, 400, "Election ID must match the URL Param");
    }
    Logger.debug(req, `election ID = ${inputElection}`);
    var failMsg = `Failed to update election`;
    try {
        const updatedElection = await ElectionsModel.updateElection(inputElection, req, `User editing draft Election`);
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
        const updatedElection = await ElectionsModel.updateElection(req.election, req, `Finalizing election`);
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
    getElectionByID,
    getSandboxResults,
    editElection,
    finalize,
}