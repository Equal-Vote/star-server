import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { permissions } from '../../../domain_model/permissions';
import { expectPermission } from "./controllerUtils";
import { BadRequest, InternalServerError } from "@curveball/http-errors";
import { Election } from '../../../domain_model/Election';

var ElectionsModel = ServiceLocator.electionsDb();

const className = "election.Controllers";

const setPublicResults = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.finalize ${req.election.election_id}`);
    expectPermission(req.user_auth.roles, permissions.canEditElectionState)
    const election: Election = req.election
    const public_results = req.body.public_results
    if (typeof public_results !== 'boolean') {
        throw new BadRequest('public_results setting not provided or incorrect type')
    }
    election.settings.public_results = public_results

    const updatedElection = await ElectionsModel.updateElection(election, req, `Publish Results`);
    if (!updatedElection) {
        const failMsg = 'could not update public_results setting'
        Logger.info(req, failMsg);
        throw new BadRequest(failMsg)
    }

    return res.json({ election: updatedElection })
}

module.exports = {
    setPublicResults,
}