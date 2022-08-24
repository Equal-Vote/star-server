import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { permissions } from '../../../domain_model/permissions';
import { expectPermission } from "./controllerUtils";
import { BadRequest, InternalServerError } from "@curveball/http-errors";
import { Invites } from "../Services/Email/EmailTemplates"
import { ElectionRoll } from '../../../domain_model/ElectionRoll';

var ElectionsModel = ServiceLocator.electionsDb();
var ElectionRollModel = ServiceLocator.electionRollDb();
var EmailService = ServiceLocator.emailService();

const className = "election.Controllers";

const finalizeElection = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.finalize ${req.election.election_id}`);
    expectPermission(req.user_auth.roles, permissions.canEditElectionState)
    if (req.election.state !== 'draft') {
        var msg = "Election already finalized";
        Logger.info(req, msg);
        throw new BadRequest(msg)
    }

    const electionId = req.election.election_id;
    let electionRoll:ElectionRoll[]|null = null
    if (req.election.settings.election_roll_type === 'Email') {
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

    if (updatedElection.settings.election_roll_type === 'Email') {
        Logger.info(req, `${className}.sendInvitations`, { election_id: updatedElection.election_id });
        try {
            const url = req.protocol + '://' + req.get('host')
            const invites = Invites(updatedElection, electionRoll as ElectionRoll[], url)
            EmailService.sendEmails(invites)
        } catch (err: any) {
            const msg = `Could not send invitations`;
            Logger.error(req, `${msg}: ${err.message}`);

            throw new InternalServerError(failMsg)
        }
    }
    return res.json({ election: updatedElection })
}

module.exports = {
    finalizeElection,
}