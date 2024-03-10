import { Election, electionValidation } from "shared/domain_model/Election";
import { ElectionRoll, ElectionRollState } from "shared/domain_model/ElectionRoll";
import { Ballot, Ballot as BallotType, ballotValidation } from 'shared/domain_model/Ballot';
import { IRequest } from "../IRequest";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { BadRequest, InternalServerError, Unauthorized } from "@curveball/http-errors";
import { ILoggingContext } from "../Services/Logging/ILogger";
import { randomUUID } from "crypto";
import { Uid } from "shared/domain_model/Uid";
import { Receipt } from "../Services/Email/EmailTemplates"
import { getOrCreateElectionRoll, checkForMissingAuthenticationData, getVoterAuthorization } from "./voterRollUtils"
import { IElectionRequest } from "../IRequest";
import { Response, NextFunction } from 'express';

const ElectionsModel = ServiceLocator.electionsDb();
const ElectionRollModel = ServiceLocator.electionRollDb();
const BallotModel = ServiceLocator.ballotsDb();
const EventQueue = ServiceLocator.eventQueue();
const EmailService = ServiceLocator.emailService();

type CastVoteEvent = {
    requestId:Uid,
    inputBallot:Ballot,
    roll?:ElectionRoll,
    userEmail?:string,
}

const castVoteEventQueue = "castVoteEvent";

async function castVoteController(req: IElectionRequest, res: Response, next: NextFunction) {
    Logger.info(req, "Cast Vote Controller");
    
    const targetElection = req.election;
    if (targetElection == null){
            const errMsg = "Invalid Ballot: invalid election Id";
            Logger.info(req, errMsg);
            throw new BadRequest(errMsg);
        }
 
    if (targetElection.state!=='open'){
        Logger.info(req, "Ballot Rejected. Election not open.", targetElection);
        throw new BadRequest("Election is not open");
    }
    
    const user = req.user;
    
    const missingAuthData = checkForMissingAuthenticationData(req,targetElection, req)
    if (missingAuthData !== null) {
        throw new Unauthorized(missingAuthData);
    }

    const roll = await getOrCreateElectionRoll(req, targetElection, req);
    const voterAuthorization = getVoterAuthorization(roll,missingAuthData)
    assertVoterMayVote(voterAuthorization, req);

   const inputBallot: Ballot = req.body.ballot;
   const receiptEmail: string = req.body.receiptEmail
   //TODO: currently we have both a value on the input Ballot, and the route param.
    //do we want to keep both?  enforce that they match?
    inputBallot.election_id = targetElection.election_id;
    if (roll) {
        inputBallot.precinct = roll.precinct
    }
    const validationErr = ballotValidation(targetElection, inputBallot);
    if (validationErr){
        const errMsg = "Invalid Ballot: "+ validationErr
        Logger.info(req, errMsg);
        throw new BadRequest(errMsg);
    }

    //some ballot info should be server-authorative
    inputBallot.date_submitted = Date.now();
    if (inputBallot.history == null){
        inputBallot.history = [];
    }
    inputBallot.ballot_id = randomUUID();
    //TODO, ensure the user ID is added to the ballot...
    //should server-authenticate the user id based on auth token
    inputBallot.history.push({
        action_type:"submit",
        actor: roll===null ? '' : roll.voter_id ,
        timestamp:inputBallot.date_submitted,
    });

    Logger.debug(req, "Submit Ballot:", inputBallot);
    if (roll != null){
        roll.ballot_id = String(inputBallot.ballot_id);
        roll.submitted = true;
        if (roll.history == null){
            roll.history = [];
        }
        roll.history.push({
            action_type:"submit",
            actor: roll===null ? '' : roll.voter_id ,
            timestamp:inputBallot.date_submitted,
        });
    }

    const reqId = req.contextId ? req.contextId : randomUUID();
    const userEmail = receiptEmail;
    const event = {
        requestId:reqId,
        inputBallot:inputBallot,
        roll:roll,
        userEmail:userEmail,
    }

    await (await EventQueue).publish(castVoteEventQueue, event);
    res.status(200).json({ ballot: inputBallot} );
    Logger.debug(req, "CastVoteController done, saved event to store", event);
};


async function handleCastVoteEvent(job: { id: string; data: CastVoteEvent; }):Promise<void> {
    const event = job.data;
    const ctx = Logger.createContext(event.requestId);

    var savedBallot = await BallotModel.getBallotByID(event.inputBallot.ballot_id, ctx);
    if (!savedBallot){
        savedBallot = await BallotModel.submitBallot(event.inputBallot, ctx, `User submits a ballot`);
    }
    if (event.roll != null){
        await ElectionRollModel.update(event.roll, ctx, `User submits a ballot`);
    }

    if (event.userEmail){
        const targetElection = await ElectionsModel.getElectionByID(event.inputBallot.election_id, ctx);
        if (targetElection == null){
            throw new InternalServerError("Target Election null: " + ctx.contextId);
        }
        const url = ServiceLocator.globalData().mainUrl;
        const receipt = Receipt(targetElection, event.userEmail, savedBallot, url)
        await EmailService.sendEmails([receipt])
    }
}

function assertVoterMayVote(voterAuthorization:any, ctx:ILoggingContext ): void{
    Logger.debug(ctx, "assert voter may vote");
    if (voterAuthorization.authorized_voter === false){
        throw new Unauthorized("User not authorized to vote");
    }
    if (voterAuthorization.has_voted === true){
        throw new BadRequest("User has already voted");
    }
    Logger.debug(ctx, "Voter authorized");
}

module.exports = {
    castVoteController,
    handleCastVoteEvent
}