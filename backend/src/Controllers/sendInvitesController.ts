import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { permissions } from '../../../domain_model/permissions';
import { expectPermission } from "./controllerUtils";
import { BadRequest, InternalServerError } from "@curveball/http-errors";
import { Invites } from "../Services/Email/EmailTemplates"
import { ElectionRoll } from '../../../domain_model/ElectionRoll';
import { Uid } from "../../../domain_model/Uid";
import { Election } from '../../../domain_model/Election';
import { randomUUID } from "crypto";

var ElectionRollModel = ServiceLocator.electionRollDb();
var EmailService = ServiceLocator.emailService();
const EventQueue = ServiceLocator.eventQueue();

const className = "election.Controllers";

const SendInviteEventQueue = "sendInviteEvent";

export type SendInviteEvent = {
    requestId: Uid,
    election: Election,
    url: string,
    electionRoll: ElectionRoll,
    sender: string,
}

const sendInvitationsController = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.finalize ${req.election.election_id}`);
    expectPermission(req.user_auth.roles, permissions.canSendEmails)

    const electionId = req.election.election_id;
    const election = req.election

    let electionRoll: ElectionRoll[] | null = null
    if (req.election.settings.voter_access === 'closed' && req.election.settings.invitation === 'email') {
        electionRoll = await ElectionRollModel.getRollsByElectionID(electionId, req);
    }

    if (!electionRoll) {
        const msg = `Election roll for ${electionId} not found`;
        Logger.info(req, msg);
        throw new BadRequest(msg)
    }

    //Filter through voters and filter out voters who have recieved invite already
    const electionRollFiltered = electionRoll.filter(roll => {
        if (!roll.email_data) return true
        if (!roll.email_data.inviteResponse) return true
        if (roll.email_data.inviteResponse.statusCode > 400) return true
        return false
    })

    await sendBatchEmailInvites(req, electionRollFiltered, election)

    return res.json({})
}

async function sendBatchEmailInvites(req: any, electionRoll: ElectionRoll[], election: Election) {
    const Jobs: SendInviteEvent[] = []
    const reqId = req.contextId ? req.contextId : randomUUID();
    const url = req.protocol + '://' + req.get('host')
    electionRoll.forEach(roll => {
        Jobs.push(
            {
                requestId: reqId,
                election: election,
                url: url,
                electionRoll: roll,
                sender: req.user.email
            }
        )
    })

    var failMsg = "Failed to send invitations";
    Logger.info(req, `${className}.sendInvitations`, { election_id: election.election_id });
    try {
        await (await EventQueue).publishBatch(SendInviteEventQueue, Jobs);

    } catch (err: any) {
        const msg = `Could not send invitations`;
        Logger.error(req, `${msg}: ${err.message}`);
        throw new InternalServerError(failMsg)
    }
}

async function handleSendInviteEvent(job: { id: string; data: SendInviteEvent; }): Promise<void> {
    const event = job.data;
    const ctx = Logger.createContext(event.requestId);
    const electionRoll = await ElectionRollModel.getByVoterID(event.election.election_id, event.electionRoll.voter_id, ctx)
    if (!electionRoll) {
        //this should hopefully never happen
        Logger.error(ctx, `Could not find voter ${event.electionRoll.voter_id}`);
        throw new InternalServerError('Could not find voter');
    }
    const invites = Invites(event.election, [electionRoll], event.url)
    const emailResponse = await EmailService.sendEmails(invites)
    if (!electionRoll.email_data) {
        electionRoll.email_data = {}
    }
    electionRoll.email_data.inviteResponse = emailResponse
    if (electionRoll.history == null){
        electionRoll.history = [];
    }
    electionRoll.history.push({
        action_type:"email invite sent",
        actor: event.sender,
        timestamp: Date.now() ,
    });
    await ElectionRollModel.update(electionRoll, ctx, `User submits a ballot`);
}

module.exports = {
    sendInvitationsController,
    handleSendInviteEvent,
    sendBatchEmailInvites
}