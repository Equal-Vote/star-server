import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
import { BadRequest } from "@curveball/http-errors";

var ElectionsModel = ServiceLocator.electionsDb();

const getElections = async (req: any, res: any, next: any) => {
    Logger.info(req, `getElections`);
    var filter = (req.query.filter == undefined) ? "" : req.query.filter;
    const Elections = await ElectionsModel.getElections(filter, req);
    if (!Elections) {
        var msg = "Election does not exist";
        Logger.info(req, msg);
        throw new BadRequest(msg);
    }
    res.json( { elections : Elections });
}

module.exports = {
    getElections,
}