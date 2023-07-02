import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { permissions } from '../../../domain_model/permissions';
import { expectPermission } from "./controllerUtils";
import { BadRequest } from "@curveball/http-errors";
import { ElectionRoll } from '../../../domain_model/ElectionRoll';
const { sendBatchEmailInvites } = require('./sendInvitesController')
import { IElectionRequest } from "../IRequest";
import { Response, NextFunction } from 'express';

var ElectionsModel = ServiceLocator.electionsDb();
var ElectionRollModel = ServiceLocator.electionRollDb();

const className = "election.Controllers";

const finalizeElection = async (req: IElectionRequest, res: Response, next: NextFunction) => {
    Logger.info(req, `${className}.finalize ${req.election.election_id}`);
    expectPermission(req.user_auth.roles, permissions.canEditElectionState)
    if (req.election.state !== 'draft') {
        var msg = "Election already finalized";
        Logger.info(req, msg);
        throw new BadRequest(msg)
    }

    const electionId = req.election.election_id;
    let electionRoll: ElectionRoll[] | null = null
    if (req.election.settings.voter_access === 'closed' && req.election.settings.invitation === 'email') {
        electionRoll = await ElectionRollModel.getRollsByElectionID(electionId, req);
        if (!electionRoll) {
            const msg = `Election roll for ${electionId} not found`;
            Logger.info(req, msg);
            throw new BadRequest(msg)
        }
    }

    var failMsg = "Failed to update Election";
    req.election.state = 'finalized'
    const updatedElection = await ElectionsModel.updateElection(req.election, req, `Finalizing election`);
    if (!updatedElection) {
        Logger.info(req, failMsg);
        throw new BadRequest(failMsg)
    }

    if (updatedElection.settings.voter_access === 'closed' && updatedElection.settings.invitation === 'email') {
        if (electionRoll) {
            await sendBatchEmailInvites(req, electionRoll, updatedElection)
        }
    }
    return res.json({ election: updatedElection })
}

module.exports = {
    finalizeElection,
}