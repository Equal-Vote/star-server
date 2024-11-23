import ServiceLocator from '../../ServiceLocator';
import Logger from '../../Services/Logging/Logger';
import { permissions } from '@equal-vote/star-vote-shared/domain_model/permissions';
import { expectPermission } from "../controllerUtils";
import { BadRequest, InternalServerError } from "@curveball/http-errors";
import { Invites } from "../../Services/Email/EmailTemplates"
import { ElectionRoll } from '@equal-vote/star-vote-shared/domain_model/ElectionRoll';
import { Uid } from "@equal-vote/star-vote-shared/domain_model/Uid";
import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import { randomUUID } from "crypto";
import { IElectionRequest } from "../../IRequest";
import { Response, NextFunction } from 'express';

var ElectionRollModel = ServiceLocator.electionRollDb();
var ElectionModel = ServiceLocator.electionsDb();
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

export type email_request_data = {
    voter_id?: string,
    email_subject?: string,
    email_body?: string,
    target: 'all'|'has_voted'|'has_not_voted',
    template: 'invite'|'receipt'|'blank',
}

export type email_request_event = {
    requestId: Uid,
    election: Election,
    url: string,
    electionRoll: ElectionRoll,
    email_subject?: string,
    email_body?: string,
    template: 'invite'|'receipt'|'blank',
    message_id: string,
    sender: string,
}

const sendEmailsController = async (req: IElectionRequest, res: Response, next: NextFunction) => {
    Logger.info(req, `${className}.sendInvitations ${req.election.election_id}`);
    expectPermission(req.user_auth.roles, permissions.canSendEmails)

    const electionId = req.election.election_id;
    const election = req.election

    const email_request: email_request_data = req.body

    let electionRoll: ElectionRoll[] | null = null
    if (!(req.election.settings.voter_access === 'closed' && req.election.settings.invitation === 'email')) {
        const msg = `Emails not enabled`;
        Logger.info(req, msg);
        throw new BadRequest(msg)
    }

    let message_id = ''

    if (email_request.voter_id) {
        const electionRollResponse = await ElectionRollModel.getByVoterID(electionId, email_request.voter_id, req)
        if (!electionRollResponse) {
            const msg = `Voter not found`;
            Logger.info(req, msg);
            throw new BadRequest(msg)
        }
        electionRoll= [electionRollResponse]
        message_id = `dm_${email_request.voter_id}_${0}` //TODO: retreive count of previous dms
    } else {
        electionRoll = await ElectionRollModel.getRollsByElectionID(electionId, req);
        if (!electionRoll) {
            const msg = `No voters found`;
            Logger.info(req, msg);
            throw new BadRequest(msg)
        }
        if (email_request.target == 'has_not_voted') {
            electionRoll = electionRoll.filter(roll => !roll.submitted)
            if (electionRoll.length == 0 || electionRoll == null) {
                const msg = `All voters have voted`;
                Logger.info(req, msg);
                throw new BadRequest(msg)
            }
        }
        // Update email campaign count in election db
        election.settings.email_campaign_count = election.settings.email_campaign_count ? election.settings.email_campaign_count + 1 : 1
        await ElectionModel.updateElection(election,req,'Email Campaign')
        message_id = `campaign_${election.settings.email_campaign_count}`
    }

    const Jobs: email_request_event[] = []
    const reqId = req.contextId ? req.contextId : randomUUID();
    const url = req.protocol + '://' + req.get('host')
    electionRoll.forEach(roll => {
        Jobs.push(
            {
                requestId: reqId,
                election: election,
                url: url,
                electionRoll: roll,
                sender: req.user.email,
                template: email_request.template,
                email_subject: email_request.email_subject,
                email_body: email_request.email_body,
                message_id: message_id,
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

    // await sendBatchEmailInvites(req, electionRollFiltered, election)

    res.json({})
}



const sendInvitationsController = async (req: IElectionRequest, res: Response, next: NextFunction) => {
    Logger.info(req, `${className}.sendInvitations ${req.election.election_id}`);
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
        if (!(roll.email_data.inviteResponse.length > 0)) return true
        if (!(roll.email_data.inviteResponse[0].statusCode < 400)) return true
        return false
    })

    if (electionRollFiltered.length == 0) {
        throw new BadRequest('All email invites have already been sent')
    }

    await sendBatchEmailInvites(req, electionRollFiltered, election)

    res.json({})
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

const sendInvitationController = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.sendInvite ${req.election.election_id} ${req.params.voter_id}`);
    expectPermission(req.user_auth.roles, permissions.canSendEmails)

    if (!(req.election.settings.voter_access === 'closed' && req.election.settings.invitation === 'email')) {
        throw new BadRequest('Email invitations not enabled')
    }
    const url = req.protocol + '://' + req.get('host')

    const electionId = req.election.election_id;
    const election = req.election
    const voter_id = req.params.voter_id
    if (!voter_id) {
        throw new BadRequest('Voter ID not specified')
    }
    const electionRoll = await ElectionRollModel.getByVoterID(electionId, voter_id, req)
    if (!electionRoll) {
        //this should hopefully never happen
        Logger.error(req, `Could not find voter ${voter_id}`);
        throw new InternalServerError('Could not find voter');
    }

    const updatedElectionRoll = await sendInvitation(req, election, electionRoll, req.user.email, url)

    return res.status('200').json({electionRoll: updatedElectionRoll})
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
    await sendInvitation(ctx, event.election, electionRoll, event.sender, event.url)
}

async function sendInvitation(ctx: any, election:Election, electionRoll: ElectionRoll, sender: string, url: string) {
    const invites = Invites(election, [electionRoll], url)
    const emailResponse = await EmailService.sendEmails(invites)
    if (!electionRoll.email_data) {
        electionRoll.email_data = {}
    }
    //Should have an array of one response in which case grab the first, but could have an error message
    let emailSuccess = false
    if (emailResponse.length > 0) {
        electionRoll.email_data.inviteResponse = emailResponse[0]
        if (emailResponse[0][0].statusCode < 400) {
            emailSuccess = true
        }
    } else {
        electionRoll.email_data.inviteResponse = emailResponse
    }
    if (electionRoll.history == null) {
        electionRoll.history = [];
    }
    electionRoll.history.push({
        action_type: `email invite sent: ${emailSuccess ? 'success' : 'failed'}`,
        actor: sender,
        timestamp: Date.now(),
    });
    try {
        const updatedElectionRoll = await ElectionRollModel.update(electionRoll, ctx, `Email Invite Sent`);
        if (updatedElectionRoll) {
            return updatedElectionRoll
        } else {
            throw new InternalServerError()
        }
    } catch (err: any) {
        const msg = `Could not update election roll`;
        Logger.error(ctx, `${msg}: ${err.message}`);
        throw new InternalServerError(msg)
    }
}

export {
    sendInvitationsController,
    sendInvitationController,
    handleSendInviteEvent,
    sendBatchEmailInvites
}