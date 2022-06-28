import { Ballot as BallotType } from '../../../domain_model/Ballot';
import { reqIdSuffix } from "../IRequest";
import Logger from "../Services/Logging/Logger";
import ServiceLocator from "../ServiceLocator";

const BallotsDB = require('../Models/Ballots');
var BallotModel = new BallotsDB(ServiceLocator.postgres());

const ballotByID = async (req: any, res: any, next: any) => {
    try {
        const ballot = await BallotModel.getElectionByID(parseInt(req.params.id));
        if (!ballot)
            return res.status('400').json({
                error: "Ballot not found"
            });

        req.ballot = ballot;
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve ballot"
        });
    }
}

const getBallotsByElectionID = async (req: any, res: any, next: any) => {
    try {
        var electionId = req.election.election_id;
        Logger.debug(req, "getBallotsByElectionID: "+electionId);
        const ballots = await BallotModel.getBallotsByElectionID(String(electionId));
        if (!ballots)
            return res.status('400').json({
                error: "Ballots not found" + reqIdSuffix(req)
            });
        Logger.debug(req, JSON.stringify(ballots));
        req.ballots = ballots;
        return next();
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve ballots" + reqIdSuffix(req)
        });
    }
}

const returnBallots = async (req: any, res: any, next: any) => {
    console.log(`-> elections.returnBallots ${req.params.id}`)
    res.json({ election: req.election, ballots: req.ballots })
}

const submitBallot = async (req: any, res: any, next: any) => {
    if (req.election.state!=='open'){
        Logger.error(req, "-> Election not open. Have: "+JSON.stringify(req.election));
        return res.status('400').json({
            error: "Election is not open" + reqIdSuffix(req)
        });
    }
    if (!req.authorized_voter){
        console.log("Voter not authorized");
        return res.status('400').json({
            error: "Voter not authorized" + reqIdSuffix(req)
        });
    }
    if (req.has_voted){
        console.log("Voter already submitted ballot");
        return res.status('400').json({
            error: "Voter already submitted ballot" + reqIdSuffix(req)
        });
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

    try {
        const savedBallot = await BallotModel.submitBallot(ballot)
        if (!savedBallot)
            return res.status('400').json({
                error: "Ballots not found"
            });
        req.electionRollEntry.submitted = true
        req.ballot = savedBallot;
        req.electionRollEntry.ballot_id = savedBallot.ballot_id;
        return next();

    } catch (err) {
        return res.status('400').json({
            error: (err as any).message
        });
    }
}

module.exports = {
    getBallotsByElectionID,
    returnBallots,
    submitBallot,
    ballotByID
}