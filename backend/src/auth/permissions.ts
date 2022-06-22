const roles = require('./roles')
const permissions = {
  canEditElectionAdmins:    [roles.system_admin, roles.owner],
  canEditElectionAuditors:  [roles.system_admin, roles.owner],
  canViewElection:          [roles.system_admin, roles.owner, roles.admin, roles.auditor],
  canEditElection:          [roles.system_admin, roles.owner, roles.admin],
  canDeleteElection:        [roles.system_admin, roles.owner],
  canEditElectionRoll:      [roles.system_admin, roles.owner],
  canAddToElectionRoll:     [roles.system_admin, roles.owner, roles.admin],
  canViewElectionRoll:      [roles.system_admin, roles.owner, roles.admin, roles.auditor],
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
module.exports = permissions