const express = require('express');
const router = express.Router();


const electionController = require('../Controllers/elections.controllers')
const ballotController = require('../Controllers/ballots.controllers')
const voterRollController = require('../Controllers/voterRolls.controller')
const authController = require('../Controllers/auth.controllers')
const createElectionController = require('../Controllers/createElectionController');
const { permissions } = require('../../../domain_model/permissions');
const { ElectionRollState } = require('../../../domain_model/ElectionRoll');

router.get('/Election/:id',
    authController.getUser,
    voterRollController.getVoterAuth,
    electionController.returnElection)
router.delete('/Election/:id',
    authController.getUser,
    authController.hasPermission(permissions.canDeleteElection),
    electionController.deleteElection)
router.post('/Election/:id/ballot',
    authController.getUser,
    voterRollController.getVoterAuth,
    electionController.returnElection)
router.post('/Election/:id/register',
        authController.getUser,
        voterRollController.getVoterAuth,
        voterRollController.registerVoter)
router.get('/Election/:id/ballots',
    authController.getUser,
    authController.hasPermission(permissions.canViewBallots),
    ballotController.getBallotsByElectionID,
    ballotController.returnBallots)
router.get('/Election/:id/rolls',
    authController.getUser,
    authController.hasPermission(permissions.canViewElectionRoll),
    voterRollController.getRollsByElectionID,
    voterRollController.returnRolls)
router.get('/Election/:id/rolls/:voter_id',
    authController.getUser,
    authController.hasPermission(permissions.canViewElectionRoll),
    voterRollController.getByVoterID)
router.post('/Election/:id/rolls/',
    authController.getUser,
    authController.hasPermission(permissions.canEditElectionRoll),
    voterRollController.editElectionRoll)

router.post('/Election/:id/rolls/approve',
    authController.getUser,
    authController.hasPermission(permissions.canApproveElectionRoll),
    voterRollController.changeElectionRollState(ElectionRollState.approved))
router.post('/Election/:id/rolls/flag',
    authController.getUser,
    authController.hasPermission(permissions.canFlagElectionRoll),
    voterRollController.changeElectionRollState(ElectionRollState.flagged))
router.post('/Election/:id/rolls/invalidate',
    authController.getUser,
    authController.hasPermission(permissions.canInvalidateElectionRoll),
    voterRollController.changeElectionRollState(ElectionRollState.invalid))
router.post('/Election/:id/rolls/unflag',
    authController.getUser,
    authController.hasPermission(permissions.canUnflagElectionRoll),
    voterRollController.changeElectionRollState(ElectionRollState.invalid))
router.post('/Election/:id/rolls/',
    authController.getUser,
    authController.hasPermission(permissions.canAddToElectionRoll),
    voterRollController.addElectionRoll)
router.get('/Elections',
    authController.getUser,
    electionController.getElections)
router.post('/Elections/',
createElectionController.createElectionController
)

router.post('/Election/:id/edit',
    authController.getUser,
    authController.isLoggedIn,
    authController.hasPermission(permissions.canEditElection),
    electionController.editElection,
    electionController.returnElection)
router.get('/ElectionResult/:id',
    ballotController.getBallotsByElectionID,
    electionController.getElectionResults)
router.post('/Election/:id/vote',
    authController.getUser,
    voterRollController.getVoterAuth,
    ballotController.submitBallot,
    voterRollController.updateElectionRoll,
    (req, res, next) => {
        res.json(
            {
                ballot: req.ballot
            }
        );
    },
)
router.post('/Election/:id/finalize',
    authController.getUser,
    authController.isLoggedIn,
    authController.assertOwnership,
    electionController.finalize,
    voterRollController.getRollsByElectionID,
    voterRollController.sendInvitations)

router.post('/Sandbox',
    electionController.getSandboxResults)

router.param('id', electionController.getElectionByID)

module.exports = router

