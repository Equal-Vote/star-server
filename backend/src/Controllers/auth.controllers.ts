import { isConstructorDeclaration } from "typescript"
import { Election } from "../../../domain_model/Election"
import Logger from "../Services/Logging/Logger"
import { responseErr } from "../Util"
const roles = require('../auth/roles')

var jwt = require('jsonwebtoken')
const className = 'Auth.Controllers';

const getUser = (req: any, res: any, next: any) => {
  Logger.info(req, `${className}.getUser`);
  //TODO! - This will not verify whether the signature is valid, need to add verification
  req.user = jwt.decode(req.cookies.id_token)
  req.user_auth = {}
  req.user_auth.roles = []
  if (req.user && req.election){
    if (req.user.sub === req.election.owner_id){
      req.user_auth.roles.push(roles.owner)
    }
    if (req.election.admin_ids && req.election.admin_ids.includes(req.user.email)){
      req.user_auth.roles.push(roles.admin)
    }
    if (req.election.audit_ids && req.election.audit_ids.includes(req.user.email)){
      req.user_auth.roles.push(roles.auditor)
    }
  }
  next()
}

const hasPermission = (permission: any) => {
  return (req: any, res: any, next: any) => {
    if (req.user_auth.roles.some( (role:any) => permission.includes(role))) {
      var msg = "Does not have permission";
      Logger.info(req, msg);
      return responseErr(res, req, 401, msg);
    }
    next()
  }
}

const isLoggedIn = (req: any, res: any, next: any) => {
  Logger.info(req, `${className}.isLoggedIn user=${!!req.user}`);
  if (!req.user) {
    var msg = "Not Logged In";
    Logger.info(req, msg);
    return responseErr(res, req, 401, msg);
  }
  next()
}

const assertOwnership = (req: any, res: any, next: any) => {
  Logger.info(req, `${className}.assertOwnership`);
  Logger.debug(req, `${req.election.owner_id} ==? ${req.user.sub}`);
  if (req.election.owner_id != req.user.sub) {
    var msg = "Unauthorized: User does not own electon";
    Logger.info(req, msg);
    return responseErr(res, req, 401, msg);
  }
  next()
}

module.exports = {
  getUser,
  isLoggedIn,
  assertOwnership,
  hasPermission
}