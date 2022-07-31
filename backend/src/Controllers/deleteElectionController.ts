import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
import { IRequest } from '../IRequest';
import { hasPermission, permissions } from '../../../domain_model/permissions';

var ElectionsModel = ServiceLocator.electionsDb();
const className = "Elections.Controllers";

const deleteElection = async (req: any, res: any, next: any) => {
    if (!hasPermission(req.user_auth, permissions.canDeleteElection)) {
        var msg = "Does not have permission";
        Logger.info(req, msg);
        return responseErr(res, req, 401, msg);
    }
    const electionId = req.election.election_id;
    Logger.info(req, `${className}.deleteElection ${electionId}`)
    var failMsg = "Election not deleted";
    try {
        const success = await ElectionsModel.delete(electionId, req, `User manually deleting election`);
        if (!success) {
            var msg = "Nothing to delete";
            Logger.error(req, msg);
            return responseErr(res, req, 400, msg);
        }
        Logger.info(req, `Deleted election ${electionId}`);
        return res.status('200')
    } catch (err: any) {
        Logger.error(req, failMsg + ". " + err.message);
        return responseErr(res, req, 500, failMsg);
    }
}
module.exports = {
    deleteElection
}