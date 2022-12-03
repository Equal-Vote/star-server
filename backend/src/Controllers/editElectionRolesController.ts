import { electionValidation } from '../../../domain_model/Election';
import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
import { expectPermission } from "./controllerUtils";
import { permissions } from '../../../domain_model/permissions';
import { BadRequest } from "@curveball/http-errors";

var ElectionsModel = ServiceLocator.electionsDb();


const editElectionRoles = async (req: any, res: any, next: any) => {

    const inputElection = req.body.Election;
    Logger.info(req, `editElectionRoles: ${req.election.election_id}`)
    expectPermission(req.user_auth.roles, permissions.canEditElectionRoles)
    // TODO: should this only be allowed in draft??
    // if (inputElection.state !== 'draft') {
    //     Logger.info(req, `Election is not editable, state=${inputElection.state}`);
    //     throw new BadRequest("Election is not editable")
    // }
    
    var failMsg = "Failed to update Election roles";
    req.election.admin_ids = req.body.admin_ids
    req.election.audit_ids = req.body.audit_ids
    req.election.credential_ids = req.body.credential_ids
    const updatedElection = await ElectionsModel.updateElection(req.election, req, `Update election roles`);
    if (!updatedElection) {
        Logger.info(req, failMsg);
        throw new BadRequest(failMsg)
    }

    req.election = updatedElection
    Logger.debug(req, `editElectionRoles succeeds for ${updatedElection.election_id}`);

    res.status('200').json({election: req.election})
}

module.exports = {
    editElectionRoles
}
