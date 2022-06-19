import { isConstructorDeclaration } from "typescript"
import { Election } from "../../../domain_model/Election"

var jwt = require('jsonwebtoken')

const getUser = (req: any, res: any, next: any) => {
  console.log('-> auth.getUser')
  //This will not verify whether the signature is valid, need to add verification
  req.user = jwt.decode(req.cookies.id_token)
  req.user_auth = {}
  if (req.user && req.election){
    req.user_auth.isOwner = req.user.sub === req.election.owner_id
    req.user_auth.isAdmin = req.election.admin_ids && req.election.admin_ids.includes(req.user.email)
    req.user_auth.isAuditor = req.election.audit_ids && req.election.audit_ids.includes(req.user.email)
  } else {
    req.user_auth.isOwner = false
    req.user_auth.isAdmin = false
    req.user_auth.isAuditor = false
  }
  req.user_auth.isSystemAdmin = false//Defaulting to false until we have system admins added to keycloak
  next()
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



const canEditElectionAdmins = (req: any, res: any, next: any) => {
  console.log(`-> auth.canEditElectionAdmins`)
  if (!(req.user_auth.isOwner || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to edit election admins"
    })
  }
  next()
}

const canEditElectionAuditors = (req: any, res: any, next: any) => {
  console.log(`-> auth.canEditElectionAuditors`)
  if (!(req.user_auth.isOwner || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to edit election auditors"
    })
  }
  next()
}

const canViewElection = (req: any, res: any, next: any) => {
  console.log(`-> auth.canEditElection`)
  if (!(req.user_auth.isOwner || req.user_auth.isAdmin || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to edit election"
    })
  }
  next()
}
const canEditElection = (req: any, res: any, next: any) => {
  console.log(`-> auth.canEditElection`)
  if (!(req.user_auth.isOwner || req.user_auth.isAdmin || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to edit election"
    })
  }
  next()
}

const canDeleteElection = (req: any, res: any, next: any) => {
  console.log(`-> auth.canDeleteElection`)
  if (!(req.user_auth.isOwner || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to delete election"
    })
  }
  next()
}



const canEditElectionRoll = (req: any, res: any, next: any) => {
  console.log(`-> auth.canEditElectionRoll`)
  if (!(req.user_auth.isOwner || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to edit election roll"
    })
  }
  next()
}

const canAddToElectionRoll = (req: any, res: any, next: any) => {
  console.log(`-> auth.canAddToElectionRoll`)
  if (!(req.user_auth.isOwner || req.user_auth.isAdmin || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to add to election roll"
    })
  }
  next()
}

const canViewElectionRoll = (req: any, res: any, next: any) => {
  console.log(`-> auth.canViewElectionRoll`)
  if (!(req.user_auth.isOwner || req.user_auth.isAdmin || req.user_auth.isAuditor || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to view election roll"
    })
  }
  next()
}

const canDeleteElectionRoll = (req: any, res: any, next: any) => {
  console.log(`-> auth.canDeleteElectionRoll`)
  if (!(req.user_auth.isOwner || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to delete election roll"
    })
  }
  next()
}

const canViewElectionRollIDs = (req: any, res: any, next: any) => {
  console.log(`-> auth.canViewElectionRollIDs`)
  if (!(req.user_auth.isAuditor || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to view election roll IDs"
    })
  }
  next()
}

const canViewBallots = (req: any, res: any, next: any) => {
  console.log(`-> auth.canViewBallots`)
  if (!(req.user_auth.isOwner || req.user_auth.isAdmin || req.user_auth.isAuditor || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to view ballots"
    })
  }
  next()
}

const canViewBallot = (req: any, res: any, next: any) => {
  console.log(`-> auth.canViewBallot`)
  //TODO: add permission for voter to view their own ballot
  if (!(req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to view ballot"
    })
  }
  next()
}

const canEditBallot = (req: any, res: any, next: any) => {
  console.log(`-> auth.canEditBallot`)
  //TODO: add permission for voter to edit their own ballot
  if (!(req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to edit ballot"
    })
  }
  next()
}

const canFlagBallot = (req: any, res: any, next: any) => {
  console.log(`-> auth.canFlagBallot`)
  //TODO: add permission for voter to edit their own ballot
  if (!(req.user_auth.isOwner || req.user_auth.isAdmin || req.user_auth.isAuditor || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to flag ballot"
    })
  }
  next()
}

const canInvalidateBallot = (req: any, res: any, next: any) => {
  console.log(`-> auth.canInvalidateBallot`)
  //TODO: add permission for voter to edit their own ballot
  if (!(req.user_auth.isOwner || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to invalidate ballot"
    })
  }
  next()
}

const canEditElectionState = (req: any, res: any, next: any) => {
  console.log(`-> auth.canEditElectionState`)
  //TODO: add permission for voter to edit their own ballot
  if (!(req.user_auth.isOwner || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to edit election state"
    })
  }
  next()
}

const canViewPreliminaryResults = (req: any, res: any, next: any) => {
  console.log(`-> auth.canViewPreliminaryResults`)
  //TODO: add permission for voter to edit their own ballot
  if (!(req.user_auth.isOwner || req.user_auth.isAdmin || req.user_auth.isAuditor || req.user_auth.isSystemAdmin)) {
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "User is not authorized to view preliminary results"
    })
  }
  next()
}


module.exports = {
  getUser,
  isLoggedIn,
  assertOwnership,
  canEditElectionAdmins,
  canEditElectionAuditors,
  canViewElection,
  canEditElection,
  canDeleteElection,
  canEditElectionRoll,
  canAddToElectionRoll,
  canViewElectionRoll,
  canDeleteElectionRoll,
  canViewElectionRollIDs,
  canViewBallots,
  canViewBallot,
  canEditBallot,
  canFlagBallot,
  canInvalidateBallot,
  canEditElectionState,
  canViewPreliminaryResults
}