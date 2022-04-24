const express = require('express');
const router = express.Router();

const electionController = require('../Controllers/elections.controllers')
const ballotController = require('../Controllers/ballots.controllers')
const voterRollController = require('../Controllers/voterRolls.controller')
const authController = require('../Controllers/auth.controllers')

router.get('/Election/:id',
    authController.getUser,
    voterRollController.getVoterAuth,
    electionController.returnElection)
router.post('/Election/:id/ballot',
    authController.getUser,
    voterRollController.getVoterAuth,
    electionController.returnElection)
router.get('/Elections',
    authController.getUser,
    electionController.getElections)
router.post('/Elections/',
    authController.getUser,
    authController.isLoggedIn,
    electionController.createElection,
    voterRollController.addElectionRoll)
router.post('/Election/:id/edit',
    authController.getUser,
    authController.isLoggedIn,
    authController.assertOwnership,
    electionController.editElection,
    voterRollController.editElectionRoll)
router.get('/ElectionResult/:id',
    ballotController.getBallotsByElectionID,
    electionController.getElectionResults)
router.post('/Election/:id/vote',
    authController.getUser,
    voterRollController.getVoterAuth,
    ballotController.submitBallot,
    voterRollController.updateElectionRoll)
    router.post('/Election/:id/finalize',
        authController.getUser,
        authController.isLoggedIn,
        authController.assertOwnership,
        electionController.finalize)

router.post('/Sandbox',
    electionController.getSandboxResults)

router.param('id', electionController.getElectionByID)

module.exports = router

