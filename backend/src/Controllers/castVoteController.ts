import { Election, electionValidation } from "../../../domain_model/Election";
import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import { Ballot, Ballot as BallotType, ballotValidation } from '../../../domain_model/Ballot';
import { IRequest } from "../IRequest";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { BadRequest, InternalServerError, Unauthorized } from "@curveball/http-errors";
import { ILoggingContext } from "../Services/Logging/ILogger";
import {expectUserFromRequest, expectValidElectionFromRequest, catchAndRespondError} from "./controllerUtils";
import { randomUUID } from "crypto";

const ElectionsModel = ServiceLocator.electionsDb();
const ElectionRollModel = ServiceLocator.electionRollDb();
const BallotModel = ServiceLocator.ballotsDb();
const CastVoteStore = ServiceLocator.castVoteStore();


async function castVoteController(req: IRequest, res: any, next: any) {
    Logger.info(req, "Cast Vote Controller");

    const user = expectUserFromRequest(req);
    const inputBallot:Ballot = req.body.ballot;
    const validationErr = ballotValidation(inputBallot);
    if (validationErr){
        const errMsg = "Invalid Ballot: "+ validationErr
        Logger.info(req, errMsg);
        throw new BadRequest(errMsg);
    }

    //TODO: currently we have both a value on the input Ballot, and the route param.
    //do we want to keep both?  enforce that they match?
    const targetElectionId = req.params.id;
    inputBallot.election_id = targetElectionId;
    const targetElection = await ElectionsModel.getElectionByID(targetElectionId, req);
    if (targetElection == null){
        const errMsg = "Invalid Ballot: invalid election Id";
        Logger.info(req, errMsg);
        throw new BadRequest(errMsg);
    }

    if (targetElection.state!=='open'){
        Logger.info(req, "Ballot Rejected. Election not open.", targetElection);
        throw new BadRequest("Election is not open");
    }

    const voterId = getVoterID(req, targetElection.settings.voter_id_type, user);
    Logger.debug(req, "voterID = " + voterId);
    const roll = await getOrCreateElectionRoll(targetElection, voterId, req);
    assertVoterMayVote(targetElection, roll, req);


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
        actor: voterId,
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
            actor: voterId,
            timestamp:inputBallot.date_submitted,
        });
    }

    const savedBallot = await persistBallotToStore(inputBallot, roll, req);
    res.status("200").json({ ballot: savedBallot} );
};


async function persistBallotToStore(ballot:Ballot, roll:ElectionRoll|null, ctx:ILoggingContext):Promise<Ballot> {
    Logger.debug(ctx, "persisteBallotToStore");
    var savedBallot;
    try {
        if (roll == null){
            savedBallot = await BallotModel.submitBallot(ballot, ctx, `User submits a ballot`);
        } else {
            savedBallot = await CastVoteStore.submitBallot(ballot, roll, ctx, 'User Submits a Ballot');
        }
        if (!savedBallot){
            throw new InternalServerError("Failed to cast Ballot");
        }
    } catch (err:any){
        Logger.error(ctx, 'Failed to cast Ballot:  '+err.message);
        throw err;
    }

    return savedBallot;
}


function getVoterID(req:IRequest, voterIdType:string, user:any):string {
    if (voterIdType === 'None') {
        return "";
    } else if (voterIdType === 'IP Address') {
        Logger.debug(req, `ip=${String(req.ip)}`);
        return String(req.ip)
    } else if (voterIdType === 'Email') {
        if (user == null){
            throw new Unauthorized();
        }
        return user.email;
    } else if (voterIdType === 'IDs') {
        // If voter ID not set, send response requesting voter ID to be entered
        if (!req.cookies.voter_id) {
            throw new Unauthorized();
        }
        return req.cookies.voter_id
    }
    throw new Unauthorized();
}

async function getOrCreateElectionRoll(election:Election, voterId:string, ctx:ILoggingContext ):Promise<ElectionRoll|null>{
    const voterIdType = election.settings.voter_id_type;
    Logger.debug(ctx, `getOrCreateElectionRoll: ID type: ${voterIdType}`);

    if (voterIdType === 'None') {
        return null;
    }

    const electionRollEntry = await ElectionRollModel.getByVoterID(String(election.election_id), voterId, ctx);

    if (election.settings.election_roll_type === 'None') {
        //req.authorized_voter = true;
        if (electionRollEntry == null) {
            //Adds voter to roll if they aren't currently
            const history = [{
                action_type: ElectionRollState.approved,
                actor: voterId,
                timestamp: Date.now(),
            }]
            const roll:ElectionRoll[]= [{
                election_roll_id: '',
                election_id: String(election.election_id),
                voter_id: voterId,
                submitted: false,
                state: ElectionRollState.approved,
                history: history,
            }]

            const newElectionRoll = await ElectionRollModel.submitElectionRoll(roll, ctx, `User requesting Roll and is authorized`)
            if (!newElectionRoll){
                Logger.error(ctx, "Failed to update ElectionRoll");
                throw new InternalServerError();
            }
            return roll[0];
        } 
    }
    return electionRollEntry;
}


function assertVoterMayVote(election:Election, roll:ElectionRoll|null, ctx:ILoggingContext ): void{
    const voterIdType = election.settings.voter_id_type;
    Logger.debug(ctx, "assert voter may vote: " + voterIdType + " " + (roll == null));

    if (voterIdType === 'None') {
        return;
    }
    if (roll == null) {
        throw new Unauthorized();
    }
    if (roll.submitted){
        throw new BadRequest("User has already voted");
    }
    Logger.debug(ctx, "Voter authorized");
}



module.exports = {
    castVoteController
}