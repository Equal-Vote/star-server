import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { responseErr } from "../Util";
import { hasPermission, permissions } from '../../../domain_model/permissions';
import { expectPermission } from "./controllerUtils";
import { BadRequest } from "@curveball/http-errors";

const ElectionRollModel = ServiceLocator.electionRollDb();

const className = "VoterRolls.Controllers";

const getRollsByElectionID = async (req: any, res: any, next: any) => {
    expectPermission(req.user_auth.roles, permissions.canViewElectionRoll)
    const electionId = req.election.election_id;
    Logger.info(req, `${className}.getRollsByElectionID ${electionId}`);
    //requires election data in req, adds entire election roll 

    const electionRoll = await ElectionRollModel.getRollsByElectionID(electionId, req);
    if (!electionRoll) {
        const msg = `Election roll for ${electionId} not found`;
        Logger.info(req, msg);
        throw new BadRequest(msg)
    }

    Logger.debug(req, `Got Election: ${req.params.id}`, electionRoll);
    req.electionRoll = electionRoll
    Logger.info(req, `${className}.returnRolls ${req.params.id}`);
    res.json({ election: req.election, electionRoll: electionRoll });
}

const getByVoterID = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.getByVoterID ${req.election.election_id} ${req.params.voter_id}`)
    expectPermission(req.user_auth.roles, permissions.canViewElectionRoll)
    const electionRollEntry = await ElectionRollModel.getByVoterID(req.election.election_id, req.params.voter_id, req)
    if (!electionRollEntry) {
        const msg = "Voter Roll not found";
        Logger.info(req, msg);
        throw new BadRequest(msg)
    }
    res.json({ electionRollEntry: electionRollEntry })
    next()
}

module.exports = {
    getRollsByElectionID,
    getByVoterID
}
