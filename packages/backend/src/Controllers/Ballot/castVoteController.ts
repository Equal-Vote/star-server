import { Election, electionValidation } from "@equal-vote/star-vote-shared/domain_model/Election";
import { ElectionRoll, ElectionRollState } from "@equal-vote/star-vote-shared/domain_model/ElectionRoll";
import { Ballot, Ballot as BallotType, ballotValidation } from '@equal-vote/star-vote-shared/domain_model/Ballot';
import { IRequest } from "../../IRequest";
import ServiceLocator from "../../ServiceLocator";
import Logger from "../../Services/Logging/Logger";
import { BadRequest, InternalServerError, Unauthorized } from "@curveball/http-errors";
import { ILoggingContext } from "../../Services/Logging/ILogger";
import { randomUUID } from "crypto";
import { Uid } from "@equal-vote/star-vote-shared/domain_model/Uid";
import { Receipt } from "../../Services/Email/EmailTemplates"
import { getOrCreateElectionRoll, checkForMissingAuthenticationData, getVoterAuthorization } from "../Roll/voterRollUtils"
import { innerGetGlobalElectionStats } from "../Election";
import { IElectionRequest } from "../../IRequest";
import { Response, NextFunction } from 'express';
import { io } from "../../socketHandler";
import { Server } from "socket.io";

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

async function makeBallotEvent(req: IElectionRequest, targetElection: Election, inputBallot: Ballot, voter_id?: string){
    inputBallot.election_id = targetElection.election_id;
    let roll = null;

    // skip voter roll & validation steps while in draft mode
    // TODO: we may be able to shortcut further for elections that don't require authentication
    //       ^ that could be huge when creating elections from a set of ballots
    if(targetElection.state !== 'draft'){ 
        const missingAuthData = checkForMissingAuthenticationData(req, targetElection, req, voter_id)
        if (missingAuthData !== null) {
            throw new Unauthorized(missingAuthData);
        }

        roll = await getOrCreateElectionRoll(req, targetElection, req);
        const voterAuthorization = getVoterAuthorization(roll,missingAuthData)
        assertVoterMayVote(voterAuthorization, req);

        //TODO: currently we have both a value on the input Ballot, and the route param.
        //do we want to keep both?  enforce that they match?
        if (roll) {
            inputBallot.precinct = roll.precinct
        }
        const validationErr = ballotValidation(targetElection, inputBallot);
        if (validationErr){
            const errMsg = "Invalid Ballot: "+ validationErr
            Logger.info(req, errMsg);
            throw new BadRequest(errMsg);
        }
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
    return {
        requestId:reqId,
        inputBallot:inputBallot,
        roll:roll,
        userEmail:undefined,
    }
}

async function uploadBallotsController(req: IElectionRequest, res: Response, next: NextFunction) {
    Logger.info(req, "Upload Ballots Controller");

    const targetElection = req.election;
    if (targetElection == null){
        const errMsg = "Invalid Ballot: invalid election Id";
        Logger.info(req, errMsg);
        throw new BadRequest(errMsg);
    }
 
    let events = await Promise.all(
        req.body.ballots.map(({ballot, voter_id} : {ballot: Ballot, voter_id: string}) => 
            makeBallotEvent(req, targetElection, structuredClone(ballot), voter_id).catch((err) => ({
                error: err,
                ballot: ballot
            }))
        )
    );

    let output = events.map((event, i) => ({
        voter_id: req.body.ballots[i].voter_id,
        success: !('error' in event),
        message: ('error' in event)? event.error : 'Success'
    }))

    try {
        await (await EventQueue).publishBatch(castVoteEventQueue, events.filter(event => !('error' in event)));
    }catch(err: any){
        const msg = `Could not upload ballots`;
        Logger.error(req, `${msg}: ${err.message}`);
        throw new InternalServerError(msg)
    }

    if(io != null){ // necessary for tests
        (io as Server).to('landing_page').emit('updated_stats', await innerGetGlobalElectionStats(req));
    }

    res.status(200).json({ responses: output} );
    Logger.debug(req, "CastVoteController done, saved event to store");
};

async function castVoteController(req: IElectionRequest, res: Response, next: NextFunction) {
    Logger.info(req, "Cast Vote Controller");

    const targetElection = req.election;
    if (targetElection == null){
        const errMsg = "Invalid Ballot: invalid election Id";
        Logger.info(req, errMsg);
        throw new BadRequest(errMsg);
    }
 
    if ((targetElection.state!=='open' && targetElection.state!=='draft')){
        Logger.info(req, "Ballot Rejected. Election not open.", targetElection);
        throw new BadRequest("Election is not open");
    }

    let event = await makeBallotEvent(req, targetElection, req.body.ballot)

    event.userEmail = req.body.receiptEmail;

    await (await EventQueue).publish(castVoteEventQueue, event);

    if(io != null){ // necessary for tests
        (io as Server).to('landing_page').emit('updated_stats', await innerGetGlobalElectionStats(req));
    }

    res.status(200).json({ ballot: event.inputBallot} );
    Logger.debug(req, "CastVoteController done, saved event to store");
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

export {
    castVoteController,
    uploadBallotsController,
    handleCastVoteEvent
}