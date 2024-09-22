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
 *         name: id
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
 * /Election/{id}:
 *  delete:
 *    summary: Delete election by ID
 *    tags: [Elections]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The election ID
 *    responses:
 *      200:
 *        description: Election deleted
 *      404:
 *        description: Election not found
*/
router.delete('/Election/:id', asyncHandler(deleteElection))

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
 *                $ref: '#/components/schemas/NewBallot'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *                 NewElectionRoll:
 *                   type: object
 *                   $ref: '#/components/schemas/NewElectionRoll'
 *       404:
 *         description: Election not found
 */
router.post('/Election/:id/register',asyncHandler(registerVoter))


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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *                 ballots:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ballot'
 *       404:
 *         description: Election not found
*/
router.get('/Election/:id/ballots', asyncHandler(getBallotsByElectionID))


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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: If the deletion was successful
 *       404:
 *         description: Election not found */
router.delete('/Election/:id/ballots', asyncHandler(deleteAllBallotsForElectionID))


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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ballot:
 *                   type: object
 *                   $ref: '#/components/schemas/Ballot'
 *                 
 *       404:
 *        description: Ballot not found 
*/
router.get('/Election/:id/ballot/:ballot_id', asyncHandler(getBallotByBallotID))



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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 electionRollEntry:
 *                   type: object
 *                   $ref: '#/components/schemas/ElectionRoll'
 *       404:
 *         description: Election not found 
*/
router.get('/Election/:id/rolls', asyncHandler(getRollsByElectionID))



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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 electionRollEntry:
 *                   type: object
 *                   $ref: '#/components/schemas/ElectionRoll'
 *       404:
 *         description: Roll not found 
*/
router.get('/Election/:id/rolls/:voter_id', asyncHandler(getByVoterID))


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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *                 NewElectionRoll:
 *                   type: object
 *                   $ref: '#/components/schemas/NewElectionRoll'
 *       404:
 *         description: Election not found
 */
router.post('/Election/:id/rolls/', asyncHandler(addElectionRoll))

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 electionRollEntry:
 *                   type: object
 *                   $ref: '#/components/schemas/ElectionRoll'
 *       404:
 *         description: Election not found */
 router.put('/Election/:id/rolls/', asyncHandler(editElectionRoll))

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
 *         description: Election not found */
 router.post('/Election/:id/rolls/approve', asyncHandler(approveElectionRoll))

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
 *         description: Election not found */
 router.post('/Election/:id/rolls/flag', asyncHandler(flagElectionRoll))

 /** @swagger
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
 *         description: Election not found */
 router.post('/Election/:id/rolls/invalidate', asyncHandler(invalidateElectionRoll))
 
/** 
 * 
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
 *         description: Election not found */
 router.post('/Election/:id/rolls/unflag', asyncHandler(uninvalidateElectionRoll))

/** 
 * @swagger
 * /Elections:
 *   get:
 *     summary: Get all elections
 *     tags: [Elections]
 *     responses:
 *       200:
 *         description: List of elections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 elections_as_official:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/Election'
 *                     - type: null
 *                 elections_as_unsubmitted_voter:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/Election'
 *                     - type: null
 *                     - type: undefined
 *                 elections_as_submitted_voter:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/Election'
 *                     - type: null
 *                 open_elections:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/Election'
 *                     - type: null
  */
 router.get('/Elections', asyncHandler(getElections))
 
/** 
 * @swagger
 * /Elections:
 *   post:
 *     summary: Create a new election
 *     tags: [Elections]
 *     responses:
 *       200:
 *         description: Election created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *  */
 router.post('/Elections/', asyncHandler(createElectionController))
 /** 
 * 
 * @swagger
 * /GlobalElectionStats:
 *   get:
 *     summary: Get global election statistics
 *     tags: [Elections]
 *     responses:
 *       200:
 *         description: Global election statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 elections:
 *                   type: number
 *                   description: Number of elections
 *                 votes:
 *                   type: number
 *                   description: Number of votes
 *  */
 router.get('/GlobalElectionStats', asyncHandler(getGlobalElectionStats))
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *                 voterAuth:
 *                   type: object
 *                   properties:
 *                     authorized_voter:
 *                       type: boolean
 *                     has_voted:
 *                       type: boolean
 *                     roles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/roles'
 *                     permissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/permissions'
 *       404:
 *         description: Election not found */
 router.post('/Election/:id/edit', asyncHandler(editElection))

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *       404:
 *         description: Election not found */
 router.put('/Election/:id/roles', asyncHandler(editElectionRoles))
 
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *                 results:
 *                   type: object
 *                   $ref: '#/components/schemas/ElectionResults'
 *       404:
 *         description: Election not found */
 router.get('/ElectionResult/:id', asyncHandler(getElectionResults))
 
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
 *         content: 
 *          application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ballot:
 *                 type: object
 *                 $ref: '#/components/schemas/Ballot'
 *       404:
 *         description: Election not found */
 router.post('/Election/:id/vote', asyncHandler(castVoteController))


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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *       404:
 *         description: Election not found */
router.post('/Election/:id/finalize',asyncHandler(finalizeElection))

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *       404:
 *         description: Election not found */
router.post('/Election/:id/setPublicResults',asyncHandler(setPublicResults))

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 election:
 *                   type: object
 *                   $ref: '#/components/schemas/Election'
 *       404:
 *         description: Election not found 
*/
router.post('/Election/:id/archive', asyncHandler(archiveElection))

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
 *         description: Election not found */
router.post('/Election/:id/sendInvites', asyncHandler(sendInvitationsController))
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 electionRollEntry:
 *                   type: object
 *                   $ref: '#/components/schemas/ElectionRoll'
 *       404:
 *         description: Election or voter not found */
router.post('/Election/:id/sendInvite/:voter_id', asyncHandler(sendInvitationController))

 /** 
 * @swagger
 * /Sandbox:
 *   post:
 *     summary: Get sandbox results
 *     tags: [Elections]
 *     responses:
 *       200:
 *         description: Sandbox results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: object
 *                   $ref: '#/components/schemas/ElectionResults'
 *                 nWinners:
 *                   type: number
 *                   description: Number of winners
 *                 candidates:
 *                   type: array
 *                   items: string */
 router.post('/Sandbox',asyncHandler(getSandboxResults))

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 photo_filename:
 *                   typeOf: 
 *                     - string
 *                     - null
 */
router.post('/images',upload.single("file"), asyncHandler(uploadImageController))


  



//router.param('id', asyncHandler(electionController.getElectionByID))
router.param('id', asyncHandler(getElectionByID))
router.param('id', asyncHandler(electionSpecificAuth))
router.param('id', asyncHandler(electionPostAuthMiddleware))

export default router;
