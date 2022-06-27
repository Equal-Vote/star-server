import { isConstructorDeclaration } from "typescript"
import { Election } from "../../../domain_model/Election"
const roles = require('../auth/roles')

var jwt = require('jsonwebtoken')

const getUser = (req: any, res: any, next: any) => {
  console.log('-> auth.getUser')
  //This will not verify whether the signature is valid, need to add verification
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
    if (req.election.credential_ids && req.election.credential_ids.includes(req.user.email)){
      req.user_auth.roles.push(roles.credentialer)
    }
  }
  next()
}

const hasPermission = (permission: any) => {
  return (req: any, res: any, next: any) => {
    if (!req.user_auth.roles.some( (role:any) => permission.includes(role))) {
      console.log("Does not have permission")
      return res.status('401').json({
        error: "Does not have permission"
      })
    }
    next()
  }
}

const isLoggedIn = (req: any, res: any, next: any) => {
  console.log(`-> auth.isLoggedIn ${!!req.user}`)
  if (!req.user) {
    console.log("Not Logged In")
    return res.status('400').json({
      error: "Not Logged In"
    })
  }
  next()
}

const assertOwnership = (req: any, res: any, next: any) => {
  console.log(`-> auth.assertOwnership`)
  console.log(`${req.election.owner_id} ==? ${req.user.sub}`)
  if (req.election.owner_id != req.user.sub) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "Unauthorized: User does not own election"
    })
  }
  next()
}

module.exports = {
  getUser,
  isLoggedIn,
  assertOwnership,
  hasPermission
}