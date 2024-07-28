import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { BadRequest } from "@curveball/http-errors";
import { expectPermission } from "./controllerUtils";
import { permissions } from '@equal-vote/star-vote-shared/domain_model/permissions';
import { IElectionRequest } from "../IRequest";
import { Response, NextFunction } from 'express';

const BallotModel = ServiceLocator.ballotsDb();

const innerDeleteAllBallotsForElectionID = async (req: IElectionRequest) => {
    var electionId = req.election.election_id;

    Logger.debug(req, "deleteAllBallotsForElectionID : " + electionId);

    if (req.election.state !== 'draft') {
        Logger.info(req, `Election is not in draft mode, state=${req.election.state}`);
        throw new BadRequest("Ballots can only be reset while in draft mode")
    }

    expectPermission(req.user_auth.roles, permissions.canDeleteAllBallots)

    const success = await BallotModel.deleteAllBallotsForElectionID (String(electionId), req);
    if (!success) {
        const msg = `Failed to reset ballots for election ${electionId}`;
        Logger.info(req, msg);
        throw new BadRequest(msg)
    }

    return success
}

const deleteAllBallotsForElectionID = async (req: IElectionRequest, res: Response, next: NextFunction) => {
    res.json({ success: innerDeleteAllBallotsForElectionID(req) })
}

module.exports = {
    deleteAllBallotsForElectionID,
    innerDeleteAllBallotsForElectionID
}
