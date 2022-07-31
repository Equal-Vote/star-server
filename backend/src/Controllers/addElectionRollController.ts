import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { responseErr } from "../Util";
import { hasPermission, permission, permissions } from '../../../domain_model/permissions';

const ElectionRollModel = ServiceLocator.electionRollDb();

const className = "VoterRolls.Controllers";

const addElectionRoll = async (req: any, res: any, next: any) => {
    if (!hasPermission(req.user_auth.roles, permissions.canAddToElectionRoll)) {
        var msg = "Does not have permission";
        Logger.info(req, msg);
        return responseErr(res, req, 401, msg);
    }
    Logger.info(req, `${className}.addElectionRoll ${req.election.election_id}`);
    try {
        const history = [{
            action_type: 'added',
            actor: req.user.email,
            timestamp: Date.now(),
        }]
        const rolls: ElectionRoll[] = req.body.VoterIDList.map((id: string) => ({
            election_id: req.election.election_id,
            voter_id: id,
            submitted: false,
            state: ElectionRollState.approved,
            history: history,
        }))
        const newElectionRoll = await ElectionRollModel.submitElectionRoll(rolls, req, `User adding Election Roll??`)
        if (!newElectionRoll) {
            const msg = "Voter Roll not found";
            Logger.error(req, "= = = = = = \n = = = = = ");
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }

        res.status('200').json({ election: req.election, newElectionRoll });
        return next()
    } catch (err: any) {
        const msg = `Could not add Election Roll`;
        Logger.error(req, `${msg}: ${err.message}`);
        return responseErr(res, req, 500, msg);
    }
}

module.exports = {
    addElectionRoll,
}