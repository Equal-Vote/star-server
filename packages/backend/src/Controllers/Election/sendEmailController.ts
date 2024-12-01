import ServiceLocator from '../../ServiceLocator';
import Logger from '../../Services/Logging/Logger';
import { permissions } from '@equal-vote/star-vote-shared/domain_model/permissions';
import { expectPermission } from "../controllerUtils";
import { BadRequest, InternalServerError } from "@curveball/http-errors";
import { makeEmails } from "../../Services/Email/EmailTemplates"
import { ElectionRoll, ElectionRollAction } from '@equal-vote/star-vote-shared/domain_model/ElectionRoll';
import { Uid } from "@equal-vote/star-vote-shared/domain_model/Uid";
import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import { randomUUID } from "crypto";
import { IElectionRequest } from "../../IRequest";
import { Response, NextFunction } from 'express';
import { Imsg } from '../../Services/Email/IEmail';

var ElectionRollModel = ServiceLocator.electionRollDb();
var ElectionModel = ServiceLocator.electionsDb();
var EmailService = ServiceLocator.emailService();
const EventQueue = ServiceLocator.eventQueue();

const className = "election.Controllers";

const SendEmailEventQueue = "sendEmailEvent";

export type email_request_data = {
    voter_id?: string,
    email: {
        subject: string,
        body: string,
    }
    target: 'all' | 'has_voted' | 'has_not_voted' | 'single',
}

export type email_request_event = {
    requestId: Uid,
    election: Election,
    url: string,
    electionRoll: ElectionRoll,
    email: {
        subject: string,
        body: string,
    },
    message_id: string,
    sender: string,
}

const sendEmailsController = async (req: IElectionRequest, res: Response, next: NextFunction) => {
    Logger.info(req, `${className}.sendEmails ${req.election.election_id}`);
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

    if (email_request.target == 'single') {
        const electionRollResponse = await ElectionRollModel.getByVoterID(electionId, email_request.voter_id ?? '', req)
        if (!electionRollResponse) {
            const msg = `Voter not found`;
            Logger.info(req, msg);
            throw new BadRequest(msg)
        }
        electionRoll = [electionRollResponse]
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
        } else if (email_request.target == 'has_voted') {
            electionRoll = electionRoll.filter(roll => roll.submitted)
            if (electionRoll.length == 0 || electionRoll == null) {
                const msg = `No voters have voted yet`;
                Logger.info(req, msg);
                throw new BadRequest(msg)
            }
        }
        // Update email campaign count in election db
        election.settings.email_campaign_count = election.settings.email_campaign_count ? election.settings.email_campaign_count + 1 : 1
        await ElectionModel.updateElection(election, req, 'Email Campaign')
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
                email: email_request.email,
                message_id: message_id,
            }
        )
    })

    var failMsg = "Failed to send invitations";
    try {
        await (await EventQueue).publishBatch(SendEmailEventQueue, Jobs);
    } catch (err: any) {
        const msg = `Could not send invitations`;
        Logger.error(req, `${msg}: ${err.message}`);
        throw new InternalServerError(failMsg)
    }

    res.json({})
}

async function handleSendEmailEvent(job: { id: string; data: email_request_event; }): Promise<void> {
    Logger.info(undefined, `${className}.sendEmailEvent`);
    const event = job.data;
    const ctx = Logger.createContext(event.requestId);
    //Fetch latest entry
    const electionRoll = await ElectionRollModel.getByVoterID(event.election.election_id, event.electionRoll.voter_id, ctx)
    if (!electionRoll) {
        //this should hopefully never happen
        Logger.error(ctx, `Could not find voter ${event.electionRoll.voter_id}`);
        throw new InternalServerError('Could not find voter');
    }
    // await sendEmail(ctx, event.election, electionRoll, event.sender, event.url)
    let email: Imsg[] = makeEmails(event.election, [electionRoll], event.url, event.email.subject, event.email.body);

    const emailResponse = await EmailService.sendEmails(email)

    const historyUpdate: ElectionRollAction = {
        action_type: event.message_id,
        actor: event.sender,
        timestamp: Date.now(),
        email_data: emailResponse,
    }

    if (electionRoll.history == null) {
        electionRoll.history = [];
    }
    electionRoll.history.push(historyUpdate)

    try {
        const updatedElectionRoll = await ElectionRollModel.update(electionRoll, ctx, `Email Sent`);
        if (!updatedElectionRoll) {
            throw new InternalServerError()
        }
    } catch (err: any) {
        const msg = `Could not update election roll`;
        Logger.error(ctx, `${msg}: ${err.message}`);
        throw new InternalServerError(msg)
    }
}

export {
    handleSendEmailEvent,
    sendEmailsController,
}