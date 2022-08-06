import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
import { IRequest } from '../IRequest';
import { hasPermission, permissions } from '../../../domain_model/permissions';
import { expectPermission } from "./controllerUtils";
import { BadRequest } from "@curveball/http-errors";

var ElectionsModel = ServiceLocator.electionsDb();
const className = "Elections.Controllers";

const deleteElection = async (req: any, res: any, next: any) => {
    expectPermission(req.user_auth.roles, permissions.canDeleteElection)
    const electionId = req.election.election_id;
    Logger.info(req, `${className}.deleteElection ${electionId}`)
    var failMsg = "Election not deleted";
    const success = await ElectionsModel.delete(electionId, req, `User manually deleting election`);
    if (!success) {
        var msg = "Nothing to delete";
        Logger.error(req, msg);
        throw new BadRequest(msg)
    }
    Logger.info(req, `Deleted election ${electionId}`);
    return res.status('200')

}
module.exports = {
    deleteElection
}