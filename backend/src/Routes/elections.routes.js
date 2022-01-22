const express = require('express');
const router = express.Router();

const electionController = require('../Controllers/elections.controllers')

router.get('/Election/:id',electionController.getElection)
router.get('/Elections',electionController.getElections)
router.post('/Elections/',electionController.createElection)
router.get('/ElectionResult/:id',electionController.getElectionResults)
router.post('/Election/:id',electionController.submitBallot)

module.exports = router

