import ServiceLocator from "../../ServiceLocator";
import Logger from "../../Services/Logging/Logger";
import { BadRequest } from "@curveball/http-errors";
import { IElectionRequest } from "../../IRequest";
import { Response, NextFunction } from 'express';

const BallotModel = ServiceLocator.ballotsDb();

const getBallotByBallotID = async (req: IElectionRequest, res: Response, next: NextFunction) => {
    var electionId = req.election.election_id;
    var ballot_id = req.params.ballot_id
    if (!ballot_id) {
        throw new BadRequest('No Ballot ID provided')
    }
    Logger.debug(req, "getBallotByBallotID: " + ballot_id);

    const ballot = await BallotModel.getBallotByID(ballot_id, req);
    if (!ballot) {
        const msg = `Ballots not found for Election ${electionId}`;
        Logger.info(req, msg);
        throw new BadRequest(msg)
    }
    if (electionId !== ballot.election_id){
        throw new BadRequest('Incorrect Election ID')
    }
    Logger.debug(req, "ballot = ", ballot);
    res.json({ ballot: ballot })
}

export {
    getBallotByBallotID
}
