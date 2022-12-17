import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { responseErr } from "../Util";
import { hasPermission, permission, permissions } from '../../../domain_model/permissions';
import { expectPermission } from "./controllerUtils";
import { InternalServerError } from "@curveball/http-errors";
import { randomUUID } from "crypto";

const ElectionRollModel = ServiceLocator.electionRollDb();

const className = "VoterRolls.Controllers";

const addElectionRoll = async (req: any, res: any, next: any) => {
    expectPermission(req.user_auth.roles, permissions.canAddToElectionRoll)
    Logger.info(req, `${className}.addElectionRoll ${req.election.election_id}`);
    const history = [{
        action_type: 'added',
        actor: req.user.email,
        timestamp: Date.now(),
    }]
    const rolls: ElectionRoll[] = req.body.electionRoll.map((roll: ElectionRoll) => ({
        voter_id: roll.voter_id || randomUUID(),
        election_id: req.election.election_id,
        email: roll.email,
        submitted: false,
        precinct: roll.precinct,
        state: roll.state || ElectionRollState.approved,
        history: history,
    }))
    const newElectionRoll = await ElectionRollModel.submitElectionRoll(rolls, req, `User adding Election Roll??`)
    if (!newElectionRoll) {
        const msg = "Voter Roll not found";
        Logger.error(req, "= = = = = = \n = = = = = ");
        Logger.info(req, msg);
        throw new InternalServerError(msg);
    }

    res.status('200').json({ election: req.election, newElectionRoll });
    return next()
}

module.exports = {
    addElectionRoll,
}