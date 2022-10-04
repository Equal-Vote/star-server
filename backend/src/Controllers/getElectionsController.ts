import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
import { BadRequest } from "@curveball/http-errors";
import { Election, removeHiddenFields } from '../../../domain_model/Election';


var ElectionsModel = ServiceLocator.electionsDb();

const getElections = async (req: any, res: any, next: any) => {
    Logger.info(req, `getElections`);
    var filter = (req.query.filter == undefined) ? "" : req.query.filter;
    var elections = await ElectionsModel.getElections(filter, req);
    if (!elections) {
        var msg = "Election does not exist";
        Logger.info(req, msg);
        throw new BadRequest(msg);
    }
    elections.forEach((elec:Election)=> {
        removeHiddenFields(elec);
    })
    res.json( { elections : elections });
}

module.exports = {
    getElections,
}