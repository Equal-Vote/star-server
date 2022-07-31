import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { responseErr } from "../Util";
import { hasPermission, permissions } from '../../../domain_model/permissions';

const ElectionRollModel = ServiceLocator.electionRollDb();

const className = "VoterRolls.Controllers";

const getRollsByElectionID = async (req: any, res: any, next: any) => {
    if (!hasPermission(req.user_auth.roles, permissions.canViewElectionRoll)) {
        var msg = "Does not have permission";
        Logger.info(req, msg);
        return responseErr(res, req, 401, msg);
    }
    const electionId = req.election.election_id;
    Logger.info(req, `${className}.getRollsByElectionID ${electionId}`);
    //requires election data in req, adds entire election roll 
    try {
        const electionRoll = await ElectionRollModel.getRollsByElectionID(electionId, req);
        if (!electionRoll) {
            const msg = `Election roll for ${electionId} not found`;
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }

        Logger.debug(req, `Got Election: ${req.params.id}`, electionRoll);
        req.electionRoll = electionRoll
        Logger.info(req, `${className}.returnRolls ${req.params.id}`);
        res.json({ election: req.election, electionRoll: req.electionRoll });
    } catch (err: any) {
        const msg = `Could not retrieve election roll`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

const getByVoterID = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.getByVoterID ${req.election.election_id} ${req.params.voter_id}`)
    if (!hasPermission(req.user_auth.roles, permissions.canViewElectionRoll)) {
        var msg = "Does not have permission";
        Logger.info(req, msg);
        return responseErr(res, req, 401, msg);
    }
    try {
        const electionRollEntry = await ElectionRollModel.getByVoterID(req.election.election_id, req.params.voter_id, req)
        if (!electionRollEntry) {
            const msg = "Voter Roll not found";
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        res.json({ electionRollEntry: electionRollEntry })
        next()
    } catch (err: any) {
        const msg = `Could not find election roll entry`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

module.exports = {
    getRollsByElectionID,
    getByVoterID
}
