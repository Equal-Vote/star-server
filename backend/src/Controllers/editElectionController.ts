import { electionValidation } from '../../../domain_model/Election';
import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
import { expectPermission } from "./controllerUtils";
import { permissions } from '../../../domain_model/permissions';
import { BadRequest } from "@curveball/http-errors";

var ElectionsModel = ServiceLocator.electionsDb();


const editElection = async (req: any, res: any, next: any) => {

    const inputElection = req.body.Election;
    Logger.info(req, `editElection: ${req.election.election_id}`)
    expectPermission(req.user_auth.roles, permissions.canViewBallots)
    const validationErr = electionValidation(inputElection);
    if (validationErr) {
        Logger.info(req, "Invalid Election: " + validationErr);
        throw new BadRequest("Invalid Election")
    }

    if (inputElection.state !== 'draft') {
        Logger.info(req, `Election is not editable, state=${inputElection.state}`);
        throw new BadRequest("Election is not editable")
    }
    if (inputElection.election_id != req.params.id) {
        Logger.info(req, `Body Election ${inputElection.election_id} != param ID ${req.params.id}`);
        throw new BadRequest("Election ID must match the URL Param")
    }
    Logger.debug(req, `election ID = ${inputElection}`);
    var failMsg = `Failed to update election`;

    const updatedElection = await ElectionsModel.updateElection(inputElection, req, `User editing draft Election`);
    if (!updatedElection) {
        Logger.error(req, failMsg);
        throw new BadRequest(failMsg)
    }
    req.election = updatedElection
    Logger.debug(req, `editElection succeeds for ${updatedElection.election_id}`);

    res.json({ election: req.election, voterAuth: { authorized_voter: req.authorized_voter, has_voted: req.has_voted, roles: req.user_auth.roles } })
}

module.exports = {
    editElection
}
