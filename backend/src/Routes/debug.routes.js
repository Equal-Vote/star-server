const express = require('express');
const router = express.Router();
import { tempTestSuite } from '../test/TempTestSuite';

const voterRollController = require('../Controllers/voterRolls.controller')

// Just for debugging
router.get('/', (req, res) => {
    res.json("19:40")
})

router.get('/test', (req, res) => {
    tempTestSuite().then(
        val => {
            res.json(val);
        }
    ).catch(
        err => {
            console.log(err);
            res.json(err);
        }
    )
})
router.get('/addRoll', (req, res, next) => {
    const election = { election_id: '0' }
    req.election = election
    req.body.VoterIDList = ['Alexa', 'Bob', 'Carol', 'Dave']
    next()
},
    voterRollController.addVoterRoll
)

router.get('/getRoll', (req, res, next) => {
    const election = { election_id: '0' }
    req.election = election
    req.voter_id = "Bob"
    next()
},
    voterRollController.getByVoterID,
    (req, res, next) => {
        res.status('200').json(req.electionRollEntry)
    }
    
)
router.get('/updateRoll', (req, res, next) => {
    const election = { election_id: '0' }
    req.election = election
    req.voter_id = "Bob"
    next()
},
    voterRollController.getByVoterID,
    (req, res, next) => {
        console.log(req.electionRollEntry)
        req.electionRollEntry = req.electionRollEntry[0]
        req.electionRollEntry.submitted = true
        next()
    },
    voterRollController.updateVoterRoll,
    voterRollController.getByVoterID,
    (req, res, next) => {
        res.status('200').json(req.electionRollEntry)
    }
    
)

module.exports = router