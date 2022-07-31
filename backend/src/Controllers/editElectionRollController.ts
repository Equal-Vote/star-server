import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { responseErr } from "../Util";
import { hasPermission, permissions } from '../../../domain_model/permissions';

const ElectionRollModel = ServiceLocator.electionRollDb();

const className="VoterRolls.Controllers";

const editElectionRoll = async (req: any, res: any, next: any) => {
    if (!hasPermission(req.user_auth, permissions.canEditElectionRoll)){
        var msg = "Does not have permission";
        Logger.info(req, msg);
        return responseErr(res, req, 401, msg);
    }
    const electinoRollInput = req.body.electionRollEntry;
    Logger.info(req, `${className}.editElectionRoll`, {electionRollEntry: electinoRollInput});
    try {
        if (electinoRollInput.history == null) {
            electinoRollInput.history = [];
        }
        electinoRollInput.history.push([{
            action_type: 'edited',
            actor: req.user.email,
            timestamp: Date.now(),
        }])
        const electionRollEntry = await ElectionRollModel.update(electinoRollInput, req, `User Editing Election Roll`);
        if (!electionRollEntry){
            const msg= "Election Roll not found";
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        req.electionRollEntry = electionRollEntry
        res.status('200').json(electionRollEntry)
    } catch (err:any) {
        const msg = `Could not edit Election Roll`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

module.exports = {
    editElectionRoll,
}
