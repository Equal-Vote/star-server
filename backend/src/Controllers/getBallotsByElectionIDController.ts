import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { BadRequest } from "@curveball/http-errors";
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
import { expectPermission } from "./controllerUtils";
import { permissions } from '../../../domain_model/permissions';

const BallotModel = ServiceLocator.ballotsDb();

const getBallotsByElectionID = async (req: any, res: any, next: any) => {
    var electionId = req.election.election_id;
    Logger.debug(req, "getBallotsByElectionID: " + electionId);

    expectPermission(req.user_auth.roles, permissions.canViewBallots)

    const ballots = await BallotModel.getBallotsByElectionID(String(electionId), req);
    if (!ballots) {
        const msg = `Ballots not found for Election ${electionId}`;
        Logger.info(req, msg);
        throw new BadRequest(msg)
    }
    Logger.debug(req, "ballots = ", ballots);
    res.json({ election: req.election, ballots: ballots })
}

module.exports = {
    getBallotsByElectionID
}
