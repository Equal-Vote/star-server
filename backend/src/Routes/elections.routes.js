const express = require('express');
const router = express.Router();


const electionController = require('../Controllers/elections.controllers')
const ballotController = require('../Controllers/ballots.controllers')
const voterRollController = require('../Controllers/voterRolls.controller')
const authController = require('../Controllers/auth.controllers')
const { deleteElection } = require('../Controllers/deleteElectionController')
const changeElectionRollStateController = require('../Controllers/changeElectionRollController')
const { editElectionRoll } = require('../Controllers/editElectionRollController')
const { addElectionRoll } = require('../Controllers/addElectionRollController')
const { getRollsByElectionID, getByVoterID } = require('../Controllers/getElectionRollController')
const createElectionController = require('../Controllers/createElectionController');
const { castVoteController } = require('../Controllers/castVoteController');
const { finalizeElection } = require('../Controllers/finalizeElectionController')
const { permissions } = require('../../../domain_model/permissions');
const { ElectionRollState } = require('../../../domain_model/ElectionRoll');
const asyncHandler = require('express-async-handler')

router.get('/Election/:id',
    voterRollController.getVoterAuth,
    electionController.returnElection)
router.delete('/Election/:id', asyncHandler(deleteElection))
router.post('/Election/:id/ballot',
    voterRollController.getVoterAuth,
    electionController.returnElection)
router.post('/Election/:id/register',
    voterRollController.getVoterAuth,
    voterRollController.registerVoter)
router.get('/Election/:id/ballots',
    authController.hasPermission(permissions.canViewBallots),
    ballotController.getBallotsByElectionID,
    ballotController.returnBallots)
router.get('/Election/:id/rolls', asyncHandler(getRollsByElectionID))
router.get('/Election/:id/rolls/:voter_id', asyncHandler(getByVoterID))
router.post('/Election/:id/rolls/', asyncHandler(editElectionRoll))
router.post('/Election/:id/rolls/approve', asyncHandler(changeElectionRollStateController.approveElectionRoll))
router.post('/Election/:id/rolls/flag', asyncHandler(changeElectionRollStateController.flagElectionRoll))
router.post('/Election/:id/rolls/invalidate', asyncHandler(changeElectionRollStateController.invalidateElectionRoll))
router.post('/Election/:id/rolls/unflag', asyncHandler(changeElectionRollStateController.uninvalidateElectionRoll))
router.post('/Election/:id/rolls/', asyncHandler(addElectionRoll))
router.get('/Elections', asyncHandler(electionController.getElections))
router.post('/Elections/', asyncHandler(createElectionController.createElectionController))

router.post('/Election/:id/edit',
    authController.isLoggedIn,
    authController.hasPermission(permissions.canEditElection),
    electionController.editElection,
    electionController.returnElection)
router.get('/ElectionResult/:id',
    ballotController.getBallotsByElectionID,
    electionController.getElectionResults)
router.post('/Election/:id/vote', asyncHandler(
    castVoteController)
)
router.post('/Election/:id/finalize',asyncHandler(finalizeElection))

router.post('/Sandbox',
    electionController.getSandboxResults)

router.param('id', asyncHandler(electionController.getElectionByID))

module.exports = router

