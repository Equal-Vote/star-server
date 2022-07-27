import { Ballot as BallotType, ballotValidation } from '../../../domain_model/Ballot';
import { reqIdSuffix } from "../IRequest";
import Logger from "../Services/Logging/Logger";
import ServiceLocator from "../ServiceLocator";
import { responseErr } from '../Util';

var BallotModel =  ServiceLocator.ballotsDb();
const className = 'Ballots.Controllers';

const ballotByID = async (req: any, res: any, next: any) => {
    try {
        const ballotId = req.params.id;
        const ballot = await BallotModel.getBallotByID(ballotId, req);
        if (!ballot){
            const msg = `Ballot ${ballotId} not found`;
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        req.ballot = ballot;
    } catch (err) {
        const msg = `Could not retrieve ballot`;
        Logger.error(req, msg);
        return responseErr(res, req, 500, msg);
    }
}

const getBallotsByElectionID = async (req: any, res: any, next: any) => {
    try {
        var electionId = req.election.election_id;
        Logger.debug(req, "getBallotsByElectionID: "+electionId);
        const ballots = await BallotModel.getBallotsByElectionID(String(electionId), req);
        if (!ballots){
            const msg = `Ballots not found for Election ${electionId}`;
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        Logger.debug(req, "ballots = ", ballots);
        req.ballots = ballots;
        return next();
    } catch (err) {
        const msg = `Could not retrieve ballots`;
        Logger.error(req, msg);
        return responseErr(res, req, 500, msg);
    }
}

const returnBallots = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.returnBallots ${req.params.id}`);
    res.json({ election: req.election, ballots: req.ballots })
}

const submitBallot = async (req: any, res: any, next: any) => {

    const inputBallot = req.body.ballot;
    const validationErr = ballotValidation(inputBallot);
    if (validationErr){
        Logger.info(req, "Invalid Ballot: "+ validationErr);
        return responseErr(res, req, 400, "Invalid Ballot");
    }

    if (req.election.state!=='open'){
        Logger.info(req, "Ballot Rejected. Election not open.", req.election);
        return responseErr(res, req, 400, "Election is not open");
    }
    if (!req.authorized_voter){
        Logger.info(req, "Ballot Rejected. Voter not authorized.", req.election);
        return responseErr(res, req, 400, "Voter not authorized");
    }
    if (req.has_voted){
        Logger.info(req, "Ballot Rejected. Voter already submitted ballot.", req.election);
        return responseErr(res, req, 400, " Voter already submitted ballot");
    }

    //some ballot info should be server-authorative
    var ballot:BallotType = req.body.ballot;
    ballot.date_submitted = Date.now();
    if (ballot.history == null){
        ballot.history = [];
    }
    //TODO, ensure the user ID is added to the ballot...
    //should server-authenticate the user id based on auth token
    ballot.history.push({
        action_type:"submit",
        actor: ballot.user_id || "unknown",
        timestamp:ballot.date_submitted,
    });

    Logger.debug(req, "Submit Ballot:", ballot);
    try {
        const savedBallot = await BallotModel.submitBallot(ballot, req, `User submits a ballot`);
        if (!savedBallot){
            return responseErr(res, req, 400, "Ballots not found");
        }
        req.electionRollEntry.submitted = true
        req.ballot = savedBallot;
        req.electionRollEntry.ballot_id = savedBallot.ballot_id;
        req.electionRollEntry.history.push({
            action_type:"submit",
            actor: ballot.user_id || "unknown",
            timestamp:ballot.date_submitted,
        });
        Logger.info(req, "Submit Ballot Success.", savedBallot);
        return next();
    } catch (err:any) {
        var errData = {
            ballot: ballot,
            error: err.message
        };
        Logger.error(req, "Submit Ballot Failure:", errData);
        return responseErr(res, req, 500, " Failed to submit ballot");
    }
}

module.exports = {
    getBallotsByElectionID,
    returnBallots,
    submitBallot,
    ballotByID
}