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
        
        Logger.debug(req, `Got Election: ${req.params.id}: ${JSON.stringify(electionRoll)}`);
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
        // console.log(req)
        const NewElectionRoll = await ElectionRollModel.submitElectionRoll(req.election.election_id, req.body.VoterIDList, false)
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
    Logger.info(req, `${className}.editElectionRoll ${JSON.stringify(electinoRollInput)}`);
    try {
        const electionRollEntry = await ElectionRollModel.update(electinoRollInput);
        if (!electionRollEntry){
            const msg= "Election Roll not found";
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        req.electionRollEntry = electionRollEntry
        Logger.debug(req, `Voter Roll updated: ${JSON.stringify(electionRollEntry)}`);
        res.status('200').json(electionRollEntry)
    } catch (err:any) {
        const msg = `Could not edit Election Roll`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

const updateElectionRoll = async (req: any, res: any, next: any) => {
    const electinoRollInput = req.electionRollEntry;
    Logger.info(req, `${className}.updateElectionRoll ${JSON.stringify(electinoRollInput)}`);

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
        Logger.debug(req, `Voter Roll Updated: ${JSON.stringify(electionRollEntry)}`);
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
            const NewElectionRoll = await ElectionRollModel.submitElectionRoll(req.election.election_id, [req.voter_id], false)
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
        console.log(`-> electionRolls.sendInvitations ${req.election.election_id}`)
        try {
            const url = req.protocol + '://'+req.get('host')
            EmailService.sendInvitations(req.election,req.electionRoll,url)
        } catch (err) {
            return res.status('400').json({
                error: "Could not send invitations"
            })
        }
    }
    return  res.json({election: req.election})
}

module.exports = {
    updateElectionRoll,
    getRollsByElectionID,
    returnRolls,
    addElectionRoll,
    getByVoterID,
    getVoterAuth,
    editElectionRoll,
    sendInvitations
}
