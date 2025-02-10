import { reqIdSuffix } from "../../IRequest";
import Logger from "../../Services/Logging/Logger";
import ServiceLocator from "../../ServiceLocator";
import { responseErr } from '../../Util';

var BallotModel =  ServiceLocator.ballotsDb();
const className = 'Ballots.Controllers';

const ballotByID = async (req: any, res: any, next: any) => {
    try {
        const ballotId = req.params.id;
        const ballot = await BallotModel.getBallotByID(ballotId, req);
        if (!ballot){
            const msg = `Ballot ${ballotId} not found`;
            Logger.info(req, msg);
            return responseErr(res, req, 400, msg);
        }
        req.ballot = ballot;
    } catch (err) {
        const msg = `Could not retrieve ballot`;
        Logger.error(req, msg);
        return responseErr(res, req, 500, msg);
    }
}


export {
    ballotByID
}