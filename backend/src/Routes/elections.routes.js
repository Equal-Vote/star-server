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
router.get('/Elections',
    authController.getUser,
    electionController.getElections)
router.post('/Elections/',
    electionController.createElection,
    voterRollController.addVoterRoll)
router.get('/ElectionResult/:id',
    ballotController.getBallotsByElectionID,
    electionController.getElectionResults)
router.post('/Election/:id',
    authController.getUser,
    voterRollController.getVoterAuth,
    ballotController.submitBallot,
    voterRollController.updateVoterRoll)

router.post('/Sandbox',
    electionController.getSandboxResults)

router.param('id', electionController.getElectionByID)

module.exports = router

