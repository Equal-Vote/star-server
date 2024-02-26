import { Election, removeHiddenFields } from 'shared/domain_model/Election';
import ServiceLocator from '../ServiceLocator';
import Logger from '../Services/Logging/Logger';
import { responseErr } from '../Util';
import { IElectionRequest, IRequest } from '../IRequest';
import { roles } from "shared/domain_model/roles"
import { getPermissions } from 'shared/domain_model/permissions';
import { getOrCreateElectionRoll, checkForMissingAuthenticationData, getVoterAuthorization } from "./voterRollUtils"
import { ElectionRoll } from 'shared/domain_model/ElectionRoll';


var ElectionsModel =  ServiceLocator.electionsDb();
var accountService = ServiceLocator.accountService();
const className="Elections.Controllers";

const getElectionByID = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.getElectionByID ${req.params.id}`);
    if (!req.params.id){
        return next();
    }
    try {
        var election = await ElectionsModel.getElectionByID(req.params.id, req);
        Logger.debug(req, `get election ${req.params.id}`);
        var failMsg = "Election not found";
        if (!election) {
            Logger.info(req, `${failMsg} electionId=${req.params.id}}`);
            return responseErr(res, req, 400, failMsg);
        }

        req.election = election;
        return next();

    } catch (err:any) {
        var failMsg = "Could not retrieve election";
        Logger.error(req, `${failMsg} ${err.message}`);
        return responseErr(res, req, 500, failMsg);
    }
}

const electionExistsByID = async (req: any, res: any, next: any) => {
    // using _id so that router.param() doesn't apply to it
    Logger.info(req, `${className}.getElectionExistsByID ${req.params._id}`);

    res.json({ exists: await ElectionsModel.electionExistsByID(req.params._id, req) })
}

const electionSpecificAuth = async (req: IRequest, res: any, next: any) => {
    if (!req.election){
        return next();
    }
    const electionKey = req.election.auth_key;
    if (electionKey == null || electionKey == ""){
        return next();
    }
    var user = accountService.extractUserFromRequest(req, electionKey);
    req.user = user;
    return next();
}

const electionPostAuthMiddleware = async (req: IElectionRequest, res: any, next: any) => {
    Logger.info(req, `${className}.electionPostAuthMiddleware ${req.params.id}`);
    try {
        // Update Election State
        var election = req.election;
        if (!election){
            var failMsg = "Election not found";
            Logger.info(req, `${failMsg} electionId=${req.params.id}}`);
            return responseErr(res, req, 400, failMsg);
        }
        election = await updateElectionStateIfNeeded(req, election);

        req.election = election;

        req.user_auth = {
            roles: [],
            permissions: []
        }
        if (req.user && req.election && req.user.typ != 'TEMP_ID'){
          if (req.user.sub === req.election.owner_id){
            req.user_auth.roles.push(roles.owner)
          }
          if (req.election.admin_ids && req.election.admin_ids.includes(req.user.email)){
            req.user_auth.roles.push(roles.admin)
          }
          if (req.election.audit_ids && req.election.audit_ids.includes(req.user.email)){
            req.user_auth.roles.push(roles.auditor)
          }
          if (req.election.credential_ids && req.election.credential_ids.includes(req.user.email)){
            req.user_auth.roles.push(roles.credentialer)
          }
        }
        req.user_auth.permissions = getPermissions(req.user_auth.roles)
        Logger.debug(req, `done with electionPostAuthMiddleware...`);
        Logger.debug(req,req.user_auth);
        return next();
    } catch (err:any) {
        var failMsg = "Could not modify election";
        Logger.error(req, `${failMsg} ${err.message}`);
        return responseErr(res, req, 500, failMsg);
    }
}

async function updateElectionStateIfNeeded(req:IRequest, election:Election):Promise<Election> {
    if (election.state === 'draft') {
        return election;
    }

    const currentTime = new Date();
    var stateChange = false;
    var stateChangeMsg = "";

    if (election.state === 'finalized') {
        var openElection = false;
        if (election.start_time) {
            const startTime = new Date(election.start_time);
            if (currentTime.getTime() > startTime.getTime()) {
                openElection = true;
            }
        } else {
            openElection = true;
        }
        if (openElection){
            stateChange = true;
            election.state = 'open';
            stateChangeMsg = `Election ${election.election_id} Transitioning to Open From ${election.state} (start time = ${election.start_time})`;
        }
    }
    if (election.state === 'open') {
        if (election.end_time) {
            const endTime = new Date(election.end_time);
            if (currentTime.getTime() > endTime.getTime()) {
                stateChange = true;
                election.state = 'closed';
                stateChangeMsg = `Election ${election.election_id} transitioning to Closed From ${election.state} (end time = ${election.end_time})`;
            }
        }
    }
    if (stateChange) {
        election = await ElectionsModel.updateElection(election, req, stateChangeMsg);
        Logger.info(req, stateChangeMsg);
    }
    return election;
}

const returnElection = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.returnElection ${req.params.id}`)
    var election = req.election;
    
    const missingAuthData = checkForMissingAuthenticationData(req, election, req)
    let roll:ElectionRoll|null = null
    if (missingAuthData === null) {
        roll = await getOrCreateElectionRoll(req, election, req);
    }
    const voterAuthorization = getVoterAuthorization(roll,missingAuthData)
    removeHiddenFields(election, roll);
    res.json({ election: election, voterAuth: { authorized_voter: voterAuthorization.authorized_voter, has_voted: voterAuthorization.has_voted, required: voterAuthorization.required, roles: req.user_auth.roles, permissions: req.user_auth.permissions } })
}

module.exports = {
    returnElection,
    getElectionByID,
    electionSpecificAuth,
    electionPostAuthMiddleware,
    electionExistsByID
}