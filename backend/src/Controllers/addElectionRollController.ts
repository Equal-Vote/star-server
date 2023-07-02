import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { responseErr } from "../Util";
import { hasPermission, permission, permissions } from '../../../domain_model/permissions';
import { expectPermission } from "./controllerUtils";
import { BadRequest, InternalServerError } from "@curveball/http-errors";
import { randomUUID } from "crypto";
import { IElectionRequest } from "../IRequest";
import { Response, NextFunction } from 'express';

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
    // Check if rolls already exist
    // TODO: move this to a dedicated database querry
    const existingRolls = await ElectionRollModel.getRollsByElectionID(req.election.election_id, req)
    if (existingRolls) {
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