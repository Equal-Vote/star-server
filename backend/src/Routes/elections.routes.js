const express = require('express');
const router = express.Router();


const electionController = require('../Controllers/elections.controllers')
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
const { getElectionResults } = require('../Controllers/getElectionResultsController')
const { getBallotsByElectionID } = require('../Controllers/getBallotsByElectionIDController')
const { editElection } = require('../Controllers/editElectionController')
const { getSandboxResults } = require('../Controllers/sandboxController')
const { getElections } = require('../Controllers/getElectionsController')
const { editElectionRoles } = require('../Controllers/editElectionRolesController')
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
router.get('/Election/:id/ballots', asyncHandler(getBallotsByElectionID))
router.get('/Election/:id/rolls', asyncHandler(getRollsByElectionID))
router.get('/Election/:id/rolls/:voter_id', asyncHandler(getByVoterID))
router.post('/Election/:id/rolls/', asyncHandler(addElectionRoll))
router.put('/Election/:id/rolls/', asyncHandler(editElectionRoll))
router.post('/Election/:id/rolls/approve', asyncHandler(changeElectionRollStateController.approveElectionRoll))
router.post('/Election/:id/rolls/flag', asyncHandler(changeElectionRollStateController.flagElectionRoll))
router.post('/Election/:id/rolls/invalidate', asyncHandler(changeElectionRollStateController.invalidateElectionRoll))
router.post('/Election/:id/rolls/unflag', asyncHandler(changeElectionRollStateController.uninvalidateElectionRoll))
router.get('/Elections', asyncHandler(getElections))
router.post('/Elections/', asyncHandler(createElectionController.createElectionController))

router.post('/Election/:id/edit', asyncHandler(editElection))
router.put('/Election/:id/roles', asyncHandler(editElectionRoles))
router.get('/ElectionResult/:id', asyncHandler(getElectionResults))
router.post('/Election/:id/vote', asyncHandler(castVoteController))
router.post('/Election/:id/finalize',asyncHandler(finalizeElection))

router.post('/Sandbox',asyncHandler(getSandboxResults))

//router.param('id', asyncHandler(electionController.getElectionByID))
router.param('id', asyncHandler(electionController.getElectionByID))
router.param('id', asyncHandler(electionController.electionSpecificAuth))
router.param('id', asyncHandler(electionController.electionPostAuthMiddleware))

module.exports = router

