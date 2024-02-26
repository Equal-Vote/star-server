import { Election, electionValidation } from "shared/domain_model/Election";
import { ElectionRoll, ElectionRollState } from "shared/domain_model/ElectionRoll";
import { IRequest } from "../IRequest";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { InternalServerError } from "@curveball/http-errors";
import { ILoggingContext } from "../Services/Logging/ILogger";
import { expectValidElectionFromRequest, catchAndRespondError, expectPermission } from "./controllerUtils";
import { Response, NextFunction } from "express";

var ElectionsModel = ServiceLocator.electionsDb();

const className = "createElectionController";
const failMsgPrfx = "CATCH:  create error electio err: ";
async function createElectionController(req: IRequest, res: Response, next: NextFunction) {
    Logger.info(req, "Create Election Controller");
    const inputElection = await expectValidElectionFromRequest(req);

    const resElection = await createAndCheckElection(inputElection, req);

    res.status(200).json({ election: resElection });
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
        Logger.error(ctx, failMsgPrfx + failMsg);
        throw new InternalServerError(failMsg);
    }
    return newElection;
};

module.exports = {
    createElectionController
}