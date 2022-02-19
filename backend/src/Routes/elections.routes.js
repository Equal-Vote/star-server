const express = require('express');
const router = express.Router();

const electionController = require('../Controllers/elections.controllers')
const ballotController = require('../Controllers/ballots.controllers')

router.get('/Election/:id',electionController.returnElection)
router.get('/Elections',electionController.getElections)
router.post('/Elections/',electionController.createElection)
router.get('/ElectionResult/:id',ballotController.getBallotsByElectionID,electionController.getElectionResults)
router.post('/Election/:id',ballotController.submitBallot)

router.param('id', electionController.getElectionByID)

module.exports = router

