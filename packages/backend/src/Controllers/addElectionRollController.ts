import { ElectionRoll, ElectionRollState } from "@equal-vote/star-vote-shared/domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { responseErr } from "../Util";
import { hasPermission, permission, permissions } from '@equal-vote/star-vote-shared/domain_model/permissions';
import { expectPermission } from "./controllerUtils";
import { BadRequest, InternalServerError } from "@curveball/http-errors";
import { randomUUID } from "crypto";
import { IElectionRequest } from "../IRequest";
import { Response, NextFunction } from 'express';
import { sharedConfig } from "@equal-vote/star-vote-shared/config";

const ElectionRollModel = ServiceLocator.electionRollDb();

const className = "VoterRolls.Controllers";

const addElectionRoll = async (req: IElectionRequest, res: Response, next: NextFunction) => {
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
    // TODO: move this to a dedicated database querry
    const existingRolls = await ElectionRollModel.getRollsByElectionID(req.election.election_id, req)

    if (existingRolls) {
        // Check if rolls already exist
        const duplicateRolls = req.body.electionRoll.filter((roll: ElectionRoll) => {
            return existingRolls.some(existingRoll => {
                if (existingRoll.email && roll.email && existingRoll.email === roll.email) return true
                if (existingRoll.voter_id && roll.voter_id && existingRoll.voter_id === roll.voter_id) return true
                return false
            })
        })
        if (duplicateRolls.length > 0) {
            throw new BadRequest(`Some submitted voters already exist: ${duplicateRolls.map( (roll: ElectionRoll) => `${roll.voter_id ? roll.voter_id : ''} ${roll.email ? roll.email : ''}`).join(',')}`)
        }

        // Check for roll limit
        let overrides = sharedConfig.ELECTION_VOTER_LIMIT_OVERRIDES as { [key: string]: number};
        let voterLimit = overrides[req.election.election_id] ?? sharedConfig.FREE_TIER_PRIVATE_VOTER_LIMIT;
        if(req.election.settings.voter_access == 'closed' && existingRolls.length + req.body.electionRoll.length > voterLimit){
            throw new BadRequest(`Request Denied: this election is limited to ${voterLimit} voters`);
        }
    }


    const newElectionRoll = await ElectionRollModel.submitElectionRoll(rolls, req, `User adding Election Roll??`)
    if (!newElectionRoll) {
        const msg = "Voter Roll not found";
        Logger.error(req, "= = = = = = \n = = = = = ");
        Logger.info(req, msg);
        throw new InternalServerError(msg);
    }

    res.status(200).json({ election: req.election, newElectionRoll });
    return next()
}

module.exports = {
    addElectionRoll,
}
