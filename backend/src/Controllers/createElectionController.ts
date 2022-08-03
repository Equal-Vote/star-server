import { Election, electionValidation } from "../../../domain_model/Election";
import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import { IRequest } from "../IRequest";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { InternalServerError } from "@curveball/http-errors";
import { ILoggingContext } from "../Services/Logging/ILogger";
import {expectUserFromRequest, expectValidElectionFromRequest, catchAndRespondError} from "./controllerUtils";

var ElectionsModel = ServiceLocator.electionsDb();
var ElectionRollModel = ServiceLocator.electionRollDb();  

const className = "createElectionController";

async function createElectionController(req: IRequest, res: any, next: any) {
        Logger.info(req, "Create Election Controller");
    try {

        const user = expectUserFromRequest(req);
        const inputElection = expectValidElectionFromRequest(req);
        const inputVoterIDList = req.body.VoterIDList;
        
        const resElection = await createAndCheckElection(inputElection, req);

        const history = [
            {
                action_type: "added",
                actor: user.email,
                timestamp: Date.now(),
            },
        ];
        const rolls: ElectionRoll[] = inputVoterIDList.map((id:string) => ({
            election_id: inputElection.election_id,
            voter_id: id,
            submitted: false,
            state: ElectionRollState.approved,
            history: history,
        }));
        const resElectionRoll = await ElectionRollModel.submitElectionRoll(
            rolls,
            req,
            `User adding Election Roll??`
        );
        if (!resElectionRoll) {
            const failMsg = "Voter Roll not created";
            Logger.error(req, failMsg);
            throw new InternalServerError(failMsg);
        }

        //TODO - not sure what the intended response was here from voterRolls.addElectionRoll ??
        res.status("200").json({ election: resElection, resElectionRoll });
    } catch (err: any) {
        Logger.error(req, "CATCH:  create error electio err: " + err.message);
        catchAndRespondError(req, res, err);
    }
};

const createAndCheckElection = async (
    inputElection: Election,
    ctx: ILoggingContext
): Promise<Election> => {
    var failMsg = "Election not created";
    const newElection = await ElectionsModel.createElection(
        inputElection,
        ctx,
        `User Creates new election`
    );
    if (!newElection) {
        Logger.error(ctx, failMsg);
        throw new InternalServerError(failMsg);
    }
    return newElection;
};

module.exports = {
    createElectionController
}