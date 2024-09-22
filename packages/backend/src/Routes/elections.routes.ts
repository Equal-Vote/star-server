const router = express.Router();

import express from 'express';
import {    returnElection,
    getElectionByID,
    electionSpecificAuth,
    electionPostAuthMiddleware,
    electionExistsByID} from '../Controllers/elections.controllers';
import { registerVoter } from '../Controllers/registerVoterController';
import {
    getUser,
    isLoggedIn,
    assertOwnership,
    hasPermission
  } from '../Controllers/auth.controllers';
import { deleteElection } from '../Controllers/deleteElectionController';
import {
    changeElectionRollState,
    approveElectionRoll,
    flagElectionRoll,
    invalidateElectionRoll,
    uninvalidateElectionRoll
} from '../Controllers/changeElectionRollController';
import { editElectionRoll } from '../Controllers/editElectionRollController';
import { addElectionRoll } from '../Controllers/addElectionRollController';
import { getRollsByElectionID, getByVoterID } from '../Controllers/getElectionRollController';
import {createElectionController} from '../Controllers/createElectionController';
import { castVoteController } from '../Controllers/castVoteController';
import { finalizeElection } from '../Controllers/finalizeElectionController';
import { setPublicResults } from '../Controllers/setPublicResultsController';
import { getElectionResults } from '../Controllers/getElectionResultsController';
import { getBallotsByElectionID } from '../Controllers/getBallotsByElectionIDController';
import { deleteAllBallotsForElectionID } from '../Controllers/deleteAllBallotsForElectionIDController';
import { getBallotByBallotID } from '../Controllers/getBallotByBallotID';
import { editElection } from '../Controllers/editElectionController';
import { getSandboxResults } from '../Controllers/sandboxController';
import { getElections, getGlobalElectionStats } from '../Controllers/getElectionsController';
import { editElectionRoles } from '../Controllers/editElectionRolesController';
import { permissions } from '@equal-vote/star-vote-shared/domain_model/permissions';
import { ElectionRollState } from '@equal-vote/star-vote-shared/domain_model/ElectionRoll';
import { uploadImageController, upload } from '../Controllers/uploadImageController';
import { archiveElection } from '../Controllers/archiveElectionController';
import { sendInvitationsController, sendInvitationController } from '../Controllers/sendInvitesController';
import asyncHandler from 'express-async-handler';
import { IElectionRequest } from '../IRequest';


  

/**
 * @swagger
 * /Election/{id}:
 *   get:
 *     summary: Get election by ID
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: The election description by ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Election'
 *       404:
 *         description: Election not found
 */
router.get('/Election/:id', asyncHandler(returnElection));

/**
 * @swagger
 * /Election/{_id}/exists:
 *   get:
 *     summary: Check if election exists by ID
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Election exists
 *         content: 
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             exists:
 *              type: boolean
 * 
 *       404:
 *         description: Election not found
 */
router.get('/Election/:_id/exists', asyncHandler(electionExistsByID))

/**
 * @swagger
 * /Election/{id}/ballot:
 *   post:
 *     summary: Return election ballot
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Election ballot returned
 *         content:
 *          application/json:
 *            schema:
 *             type: object
 *             properties:
 *               ballot: 
 *                type: object
 *                  $ref: '#/components/schemas/NewBallot'
 *                
 *       404:
 *         description: Election not found
 */
router.post('/Election/:id/ballot', asyncHandler(returnElection))

/**
 * @swagger
 * /Election/{id}/register:
 *   post:
 *     summary: Register a voter for an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Voter registered
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/ballots:
 *   get:
 *     summary: Get ballots by election ID
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: List of ballots
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/ballots:
 *   delete:
 *     summary: Delete all ballots for an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: All ballots deleted
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/ballot/{ballot_id}:
 *   get:
 *     summary: Get ballot by ballot ID
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *       - in: path
 *         name: ballot_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ballot ID
 *     responses:
 *       200:
 *         description: Ballot details
 *       404:
 *         description: Ballot not found
 */

/**
 * @swagger
 * /Election/{id}/rolls:
 *   get:
 *     summary: Get rolls by election ID
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: List of rolls
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/rolls/{voter_id}:
 *   get:
 *     summary: Get roll by voter ID
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *       - in: path
 *         name: voter_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The voter ID
 *     responses:
 *       200:
 *         description: Roll details
 *       404:
 *         description: Roll not found
 */

/**
 * @swagger
 * /Election/{id}/rolls:
 *   post:
 *     summary: Add a new roll to an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Roll added
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/rolls:
 *   put:
 *     summary: Edit an election roll
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Roll edited
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/rolls/approve:
 *   post:
 *     summary: Approve an election roll
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Roll approved
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/rolls/flag:
 *   post:
 *     summary: Flag an election roll
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Roll flagged
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/rolls/invalidate:
 *   post:
 *     summary: Invalidate an election roll
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Roll invalidated
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/rolls/unflag:
 *   post:
 *     summary: Unflag an election roll
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Roll unflagged
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Elections:
 *   get:
 *     summary: Get all elections
 *     tags: [Elections]
 *     responses:
 *       200:
 *         description: List of elections
 */

/**
 * @swagger
 * /Elections:
 *   post:
 *     summary: Create a new election
 *     tags: [Elections]
 *     responses:
 *       200:
 *         description: Election created
 */

/**
 * @swagger
 * /GlobalElectionStats:
 *   get:
 *     summary: Get global election statistics
 *     tags: [Elections]
 *     responses:
 *       200:
 *         description: Global election statistics
 */

/**
 * @swagger
 * /Election/{id}/edit:
 *   post:
 *     summary: Edit an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Election edited
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/roles:
 *   put:
 *     summary: Edit election roles
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Roles edited
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /ElectionResult/{id}:
 *   get:
 *     summary: Get election results by ID
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Election results
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/vote:
 *   post:
 *     summary: Cast a vote in an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Vote cast
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/finalize:
 *   post:
 *     summary: Finalize an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Election finalized
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/setPublicResults:
 *   post:
 *     summary: Set public results for an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Public results set
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/archive:
 *   post:
 *     summary: Archive an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Election archived
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/sendInvites:
 *   post:
 *     summary: Send invitations for an election
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     responses:
 *       200:
 *         description: Invitations sent
 *       404:
 *         description: Election not found
 */

/**
 * @swagger
 * /Election/{id}/sendInvite/{voter_id}:
 *   post:
 *     summary: Send an invitation to a specific voter
 *     tags: [Elections]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *       - in: path
 *         name: voter_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The voter ID
 *     responses:
 *       200:
 *         description: Invitation sent
 *       404:
 *         description: Election or voter not found
 */

/**
 * @swagger
 * /Sandbox:
 *   post:
 *     summary: Get sandbox results
 *     tags: [Elections]
 *     responses:
 *       200:
 *         description: Sandbox results
 */

/**
 * @swagger
 * /images:
 *   post:
 *     summary: Upload an image
 *     tags: [Elections]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 */

// using _id so that it doesn't trigger async handers in routes.params
router.delete('/Election/:id', asyncHandler(deleteElection));
router.post('/Election/:id/register',asyncHandler(registerVoter))
router.get('/Election/:id/ballots', asyncHandler(getBallotsByElectionID))
router.delete('/Election/:id/ballots', asyncHandler(deleteAllBallotsForElectionID))
router.get('/Election/:id/ballot/:ballot_id', asyncHandler(getBallotByBallotID))
router.get('/Election/:id/rolls', asyncHandler(getRollsByElectionID))
router.get('/Election/:id/rolls/:voter_id', asyncHandler(getByVoterID))
router.post('/Election/:id/rolls/', asyncHandler(addElectionRoll))
router.put('/Election/:id/rolls/', asyncHandler(editElectionRoll))
router.post('/Election/:id/rolls/approve', asyncHandler(approveElectionRoll))
router.post('/Election/:id/rolls/flag', asyncHandler(flagElectionRoll))
router.post('/Election/:id/rolls/invalidate', asyncHandler(invalidateElectionRoll))
router.post('/Election/:id/rolls/unflag', asyncHandler(uninvalidateElectionRoll))
router.get('/Elections', asyncHandler(getElections))
router.post('/Elections/', asyncHandler(createElectionController.createElectionController))
router.get('/GlobalElectionStats', asyncHandler(getGlobalElectionStats))

router.post('/Election/:id/edit', asyncHandler(editElection))
router.put('/Election/:id/roles', asyncHandler(editElectionRoles))
router.get('/ElectionResult/:id', asyncHandler(getElectionResults))
router.post('/Election/:id/vote', asyncHandler(castVoteController))
router.post('/Election/:id/finalize',asyncHandler(finalizeElection))
router.post('/Election/:id/setPublicResults',asyncHandler(setPublicResults))
router.post('/Election/:id/archive', asyncHandler(archiveElection))
router.post('/Election/:id/sendInvites', asyncHandler(sendInvitationsController))
router.post('/Election/:id/sendInvite/:voter_id', asyncHandler(sendInvitationController))

router.post('/Sandbox',asyncHandler(getSandboxResults))

router.post('/images',upload.single("file"), asyncHandler(uploadImageController))

//router.param('id', asyncHandler(electionController.getElectionByID))
router.param('id', asyncHandler(getElectionByID))
router.param('id', asyncHandler(electionSpecificAuth))
router.param('id', asyncHandler(electionPostAuthMiddleware))

export default router;
