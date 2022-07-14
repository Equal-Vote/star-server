import { ElectionRollState } from "../../../domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { responseErr } from "../Util";

const ElectionRollDB = require('../Models/ElectionRolls')
const EmailService = require('../Services/EmailService')
var ElectionRollModel = new ElectionRollDB(ServiceLocator.postgres());
const className="VoterRolls.Controllers";

const getRollsByElectionID = async (req: any, res: any, next: any) => {
    const electionId = req.election.election_id;
    Logger.info(req, `${className}.getRollsByElectionID ${electionId}`);
    //requires election data in req, adds entire election roll 
    try {
        const electionRoll = await ElectionRollModel.getRollsByElectionID(electionId)
        if (!electionRoll) {
            const msg = `Election roll for ${electionId} not found`;
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        
        Logger.debug(req, `Got Election: ${req.params.id}`, electionRoll);
        req.electionRoll = electionRoll
        return next()
    } catch (err:any) {
        const msg = `Could not retrieve election roll`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

const returnRolls = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.returnRolls ${req.params.id}`);
    res.json({ election: req.election, electionRoll: req.electionRoll });
}

const addElectionRoll = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.addElectionRoll ${req.election.election_id}`);
    try {
        const history = [{
            action_type: 'added',
            actor: req.user.email,
            timestamp: Date.now(),
        }]
        const NewElectionRoll = await ElectionRollModel.submitElectionRoll(req.election.election_id, req.body.VoterIDList, false, ElectionRollState.approved, history)
        if (!NewElectionRoll){
            const msg= "Voter Roll not found";
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        
        res.status('200').json(JSON.stringify({ election: req.election, NewElectionRoll }))
        return next()
    } catch (err:any) {
        const msg = `Could not add Election Roll`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

const editElectionRoll = async (req: any, res: any, next: any) => {
    const electinoRollInput = req.body.electionRollEntry;
    Logger.info(req, `${className}.editElectionRoll`, {electionRollEntry: electinoRollInput});
    try {
        if (electinoRollInput.history == null) {
            electinoRollInput.history = [];
        }
        electinoRollInput.history.push([{
            action_type: 'edited',
            actor: req.user.email,
            timestamp: Date.now(),
        }])
        const electionRollEntry = await ElectionRollModel.update(electinoRollInput);
        if (!electionRollEntry){
            const msg= "Election Roll not found";
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        req.electionRollEntry = electionRollEntry
        Logger.debug(req, `Voter Roll updated:`, {electionRollEntry: electinoRollInput});
        res.status('200').json(electionRollEntry)
    } catch (err:any) {
        const msg = `Could not edit Election Roll`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

const changeElectionRollState = (newState: ElectionRollState) => {
    return async (req: any, res: any, next: any) => {
        Logger.info(req, `${className}.changeElectionRollState`, {electionRollEntry: req.body.electionRollEntry, newState: newState});

        try {
            req.electionRollEntry = await ElectionRollModel.getByVoterID(req.election.election_id, req.body.electionRollEntry.voter_id)
            // Logic to control election roll state change permissions is more complex so handled here
            // Each state has valid transitions to other states and permissions associated with them
            if (req.electionRollEntry.state === ElectionRollState.registered) {
                if (!(newState === ElectionRollState.approved ||
                    newState === ElectionRollState.flagged)) {
                    return res.status('401').json({
                        error: "Invalid voter roll state transition"
                    })
                }
            } else if (req.electionRollEntry.state === ElectionRollState.approved) {
                if (!(newState === ElectionRollState.flagged)) {
                    return res.status('401').json({
                        error: "Invalid voter roll state transition"
                    })
                }
            } else if (req.electionRollEntry.state === ElectionRollState.flagged) {
                if (!(newState === ElectionRollState.approved ||
                    newState === ElectionRollState.invalid)) {
                    return res.status('401').json({
                        error: "Invalid voter roll state transition"
                    })
                }
            } else if (req.electionRollEntry.state === ElectionRollState.invalid) {
                if (!(newState === ElectionRollState.flagged)) {
                    return res.status('401').json({
                        error: "Invalid voter roll state transition"
                    })
                }
            } else {
                return res.status('401').json({
                    error: "Invalid voter roll state transition"
                })
            }

            req.electionRollEntry.state = newState;
            if (req.electionRollEntry.history == null) {
                req.electionRollEntry.history = [];
            }
            req.electionRollEntry.history.push([{
                action_type: newState,
                actor: req.user.email,
                timestamp: Date.now(),
            }])
            const updatedEntry = await ElectionRollModel.update(req.electionRollEntry)
            if (!updatedEntry)
                return res.status('400').json({
                    error: "Voter Roll not found"
                })
            req.electionRollEntry = updatedEntry
            res.status('200').json()
        } catch (err:any) {
            const msg = `Could not change election roll state`;
            Logger.error(req, `${msg}: ${err.message}`);
            return responseErr(res, req, 500, msg);
        }
    }
}

const updateElectionRoll = async (req: any, res: any, next: any) => {
    const electinoRollInput = req.electionRollEntry;
    Logger.info(req, `${className}.updateElectionRoll`, {electionRollEntry: electinoRollInput});

    // Updates single entry of election roll
    if (req.election.settings.voter_id_type === 'None') {
        Logger.debug(req, "voter_id_type is None");
        return next();
    }
    try {

        const electionRollEntry = await ElectionRollModel.update(req.electionRollEntry)
        if (!electionRollEntry){
                const msg= "Voter Roll not found";
                Logger.info(req, msg);
                return responseErr(res, req, 400, msg);
        }
        req.electionRollEntry = electionRollEntry
        Logger.debug(req, `Voter Roll Updated`, {electionRollEntry: electionRollEntry});
        return next();
    } catch (err:any) {
        const msg = `Could not update Election Roll`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

const getByVoterID = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.getByVoterID ${req.election.election_id} ${req.params.voter_id}`)
    
    try {
        const electionRollEntry = await ElectionRollModel.getByVoterID(req.election.election_id, req.params.voter_id)
        if (!electionRollEntry){
            const msg= "Voter Roll not found";
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        res.json({electionRollEntry: electionRollEntry})
        next()
    } catch (err:any) {
        const msg = `Could not find election roll entry`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

const getVoterAuth = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.getVoterAuth`);

    if (req.election.settings.voter_id_type === 'None') {
        req.authorized_voter = true
        req.has_voted = false
        req.electionRollEntry = {}
        return next()
    } else if (req.election.settings.voter_id_type === 'IP Address') {
        Logger.debug(req, `ip=${String(req.ip)}`);
        req.voter_id = String(req.ip)
    } else if (req.election.settings.voter_id_type === 'Email') {
        // If user isn't logged in, send response requesting log in
        if (!req.user) {
            return res.json({
                voterAuth: {
                    authorized_voter: false,
                    required: "Log In"
                }
            })
        }
        req.voter_id = req.user.email
    } else if (req.election.settings.voter_id_type === 'IDs') {
        // If voter ID not set, send response requesting voter ID to be entered
        if (!req.cookies.voter_id) {
            return res.json({
                voterAuth: {
                    authorized_voter: false,
                    required: "Voter ID"
                }
            })
        }
        req.voter_id = req.cookies.voter_id
    }
    try {
        const electionRollEntry = await ElectionRollModel.getByVoterID(req.election.election_id, req.voter_id)
        if (!electionRollEntry){
            const msg= "Voter Roll not found";
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }

        req.electionRollEntry = electionRollEntry
    } catch (err:any) {
        const msg = `Could not find election roll entry`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
    if (req.election.settings.election_roll_type === 'None') {
        req.authorized_voter = true;
        if (req.electionRollEntry.length == 0) {
            //Adds voter to roll if they aren't currently
            const history = [{
                action_type: ElectionRollState.approved,
                actor: req.user?.email || req.voter_id,
                timestamp: Date.now(),
            }]
            const NewElectionRoll = await ElectionRollModel.submitElectionRoll(req.election.election_id, [req.voter_id], false, ElectionRollState.approved, history)
            if (!NewElectionRoll){
                const msg= "Voter Roll not found";
                Logger.info(req, msg);
                return responseErr(res, req, 400, msg);
            }

            req.electionRollEntry = NewElectionRoll
            req.has_voted = false
            return next()
        } else {
            req.has_voted = req.electionRollEntry.submitted
            return next()
        }
    } else if (req.election.settings.election_roll_type === 'Email' || req.election.settings.election_roll_type === 'IDs') {
        if (req.electionRollEntry.length == 0) {
            req.authorized_voter = false;
            req.has_voted = false
            return next()
        } else {
            req.authorized_voter = true
            req.has_voted = req.electionRollEntry.submitted
            return next()
        }
    }
}

const sendInvitations = async (req: any, res: any, next: any) => {
    //requires election data in req, adds entire election roll 
    if (req.election.settings.election_roll_type === 'Email') {
        Logger.info(req, `${className}.sendInvitations`, {election_id: req.election.election_id});
        try {
            const url = req.protocol + '://'+req.get('host')
            EmailService.sendInvitations(req.election,req.electionRoll,url)
        } catch (err:any) {
            const msg = `Could not send invitations`;
            Logger.error(req, `${msg}: ${err.message}`);
            return responseErr(res, req, 500, msg);
        }
    }
    return res.json({ election: req.election })
}

module.exports = {
    updateElectionRoll,
    getRollsByElectionID,
    returnRolls,
    addElectionRoll,
    getByVoterID,
    getVoterAuth,
    editElectionRoll,
    sendInvitations,
    changeElectionRollState
}
