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


const { permissions } = require('../../../domain_model/permissions');
const { ElectionRollState } = require('../../../domain_model/ElectionRoll');


router.get('/Election/:id',
    authController.getUser,
    voterRollController.getVoterAuth,
    electionController.returnElection)
router.delete('/Election/:id', authController.getUser, deleteElection)
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
router.get('/Election/:id/rolls', authController.getUser, getRollsByElectionID)
router.get('/Election/:id/rolls/:voter_id', authController.getUser, getByVoterID)
router.post('/Election/:id/rolls/', authController.getUser, editElectionRoll)
router.post('/Election/:id/rolls/approve', authController.getUser, changeElectionRollStateController.approveElectionRoll)
router.post('/Election/:id/rolls/flag', authController.getUser, changeElectionRollStateController.flagElectionRoll)
router.post('/Election/:id/rolls/invalidate', authController.getUser, changeElectionRollStateController.invalidateElectionRoll)
router.post('/Election/:id/rolls/unflag', authController.getUser, changeElectionRollStateController.uninvalidateElectionRoll)
router.post('/Election/:id/rolls/', authController.getUser, addElectionRoll)
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

