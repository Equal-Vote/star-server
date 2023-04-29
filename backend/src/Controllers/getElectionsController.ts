import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
import { BadRequest } from "@curveball/http-errors";
import { Election, removeHiddenFields } from '../../../domain_model/Election';


var ElectionsModel = ServiceLocator.electionsDb();
var ElectionRollModel = ServiceLocator.electionRollDb();

const getElections = async (req: any, res: any, next: any) => {
    Logger.info(req, `getElections`);
    // var filter = (req.query.filter == undefined) ? "" : req.query.filter;
    const email = req.user?.email || ''
    const id = req.user?.sub || ''

    /////////// ELECTIONS WE OWN ////////////////
    var elections_as_official = null;
    if(email !== '' || id !== ''){ 
        elections_as_official = await ElectionsModel.getElections(id, email, req);
        if (!elections_as_official) {
            var msg = "Election does not exist";
            Logger.info(req, msg);
            throw new BadRequest(msg);
        }
        elections_as_official.forEach((elec: Election) => {
            removeHiddenFields(elec, null);
        })
    }

    /////////// ELECTIONS WE'RE INVITED TO ////////////////
    var elections_as_voter = null;
    if (email !== '') {
        let myRolls = await ElectionRollModel.getByEmail(email, req)
        let election_ids = myRolls?.map(election => election.election_id)
        if (election_ids) {
            elections_as_voter = await ElectionsModel.getElectionByIDs(election_ids,req)
            console.log(elections_as_voter)
        }
    }

    /////////// OPEN ELECTIONS ////////////////
    var open_elections = await ElectionsModel.getOpenElections(req);

    res.json({
        elections_as_official: elections_as_official,
        elections_as_voter: elections_as_voter,
        open_elections: open_elections
    });
}

module.exports = {
    getElections,
}