const express = require('express');
const router = express.Router();

const electionController = require('../Controllers/elections.controllers')
const ballotController = require('../Controllers/ballots.controllers')
const voterRollController = require('../Controllers/voterRolls.controller')
const authController = require('../Controllers/auth.controllers')
const {permissions} = require('../auth/permissions')

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
router.put('/Election/:id/rolls/state',
    authController.getUser,
    voterRollController.changeElectionRollState)
router.post('/Election/:id/rolls/',
    authController.getUser,
    authController.hasPermission(permissions.canEditElectionRoll),
    voterRollController.editElectionRoll)
router.post('/Election/:id/rolls/',
    authController.getUser,
    authController.hasPermission(permissions.canAddToElectionRoll),
    voterRollController.addElectionRoll)
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
    authController.hasPermission(permissions.canEditElection),
    electionController.editElection)
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

