import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { responseErr } from "../Util";

const EmailService = require('../Services/EmailService')
const ElectionRollModel = ServiceLocator.electionRollDb();
import { hasPermission, permission, permissions } from '../../../domain_model/permissions';

const className = "VoterRollState.Controllers";

const approveElectionRoll = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.approveElectionRoll ${req.params.id}`);
    try {
        changeElectionRollState(req, ElectionRollState.approved, [ElectionRollState.registered, ElectionRollState.flagged], permissions.canApproveElectionRoll)
    } catch (err: any) {
        const msg = `Could not change election roll state`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
    res.status('200').json()
}

const flagElectionRoll = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.flagElectionRoll ${req.params.id}`);
    try {
        changeElectionRollState(req, ElectionRollState.flagged, [ElectionRollState.approved, ElectionRollState.registered, ElectionRollState.invalid], permissions.canFlagElectionRoll)
    } catch (err: any) {
        const msg = `Could not change election roll state`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
    res.status('200').json()
}

const invalidateElectionRoll = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.flagElectionRoll ${req.params.id}`);
    try {
        changeElectionRollState(req, ElectionRollState.invalid, [ElectionRollState.flagged], permissions.canInvalidateBallot)
    } catch (err: any) {
        const msg = `Could not change election roll state`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
    res.status('200').json()
}


const uninvalidateElectionRoll = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.flagElectionRoll ${req.params.id}`);
    try {
        changeElectionRollState(req, ElectionRollState.flagged, [ElectionRollState.invalid], permissions.canInvalidateBallot)
    } catch (err: any) {
        const msg = `Could not change election roll state`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
    res.status('200').json()
}

const changeElectionRollState = async (req: any, newState: ElectionRollState, validStates: ElectionRollState[], permission: permission) => {
    if (!hasPermission(req.user_auth.roles, permission)) {
        // TODO: error throw
        // var msg = "Does not have permission";
        // Logger.info(req, msg);
        // return responseErr(res, req, 401, msg);
    }
    req.electionRollEntry = await ElectionRollModel.getByVoterID(req.election.election_id, req.body.electionRollEntry.voter_id, req)
    const currentState = req.electionRollEntry.state
    if (!validStates.includes(currentState)) {
        // return res.status('401').json({
        //     error: "Invalid voter roll state transition"
        // })
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
    const updatedEntry = await ElectionRollModel.update(req.electionRollEntry, req, "Changing Election Roll state to " + newState);
    // if (!updatedEntry)
    //TODO Error throw
        // return res.status('400').json({
        //     error: "Voter Roll not found"
        // })
    // } catch (err:any) {
    //     const msg = `Could not change election roll state`;
    //     Logger.error(req, `${msg}: ${err.message}`);
    //     return responseErr(res, req, 500, msg);
    // }
}

module.exports = {
    changeElectionRollState,
    approveElectionRoll,
    flagElectionRoll,
    invalidateElectionRoll,
    uninvalidateElectionRoll
}
