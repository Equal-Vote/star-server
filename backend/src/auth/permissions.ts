const roles = require('./roles')
const permissions = {
  canEditElectionRoles:     [roles.system_admin, roles.owner],
  canViewElection:          [roles.system_admin, roles.owner, roles.admin, roles.auditor, roles.credentialer],
  canEditElection:          [roles.system_admin, roles.owner, roles.admin],
  canDeleteElection:        [roles.system_admin, roles.owner],
  canEditElectionRoll:      [roles.system_admin, roles.owner],
  canAddToElectionRoll:     [roles.system_admin, roles.owner, roles.admin],
  canViewElectionRoll:      [roles.system_admin, roles.owner, roles.admin, roles.auditor, roles.credentialer],
  canFlagElectionRoll:      [roles.system_admin, roles.owner, roles.admin, roles.auditor, roles.credentialer],
  canApproveElectionRoll:   [roles.system_admin, roles.owner, roles.admin, roles.credentialer],
  canUnflagElectionRoll:    [roles.system_admin, roles.owner, roles.admin],
  canInvalidateElectionRoll:[roles.system_admin, roles.owner, roles.admin],
  canDeleteElectionRoll:    [roles.system_admin, roles.owner],
  canViewElectionRollIDs:   [roles.system_admin, roles.auditor],
  canViewBallots:           [roles.system_admin, roles.owner, roles.admin, roles.auditor],
  canViewBallot:            [roles.system_admin],
  canEditBallot:            [roles.system_admin, roles.owner],
  canFlagBallot:            [roles.system_admin, roles.owner, roles.admin, roles.auditor],
  canInvalidateBallot:      [roles.system_admin, roles.owner],
  canEditElectionState:     [roles.system_admin, roles.owner],
  canViewPreliminaryResults:[roles.system_admin, roles.owner, roles.admin, roles.auditor],
}

const hasPermission = (roles:string[],permission:string[]) => {
  return roles.some( (role:any) => permission.includes(role))
}

module.exports = {
  permissions,
  hasPermission,
}
