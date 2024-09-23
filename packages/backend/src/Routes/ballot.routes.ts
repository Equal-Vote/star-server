import {    
    getBallotsByElectionID,
    deleteAllBallotsForElectionID,
    getBallotByBallotID,
    castVoteController,
    ballotByID,
    handleCastVoteEvent,
    innerDeleteAllBallotsForElectionID
} from '../Controllers/Ballot';
import { returnElection } from '../Controllers/Election';
import { Router } from 'express';
import asyncHandler  from 'express-async-handler';
export const ballotRouter = Router();



/** 
 * @swagger
 * /Election/{id}/ballots:
 *   get:
 *     summary: Get ballots by election ID
 *     tags: [Ballots]
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
ballotRouter.get('/Election/:id/ballots', asyncHandler(getBallotsByElectionID))

/** 
 * @swagger
 * /Election/{id}/ballots:
 *   delete:
 *     summary: Delete all ballots for an election
 *     tags: [Ballots]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               public_results:
 *                type: boolean
 *                description: If the election results are public
 * 
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
ballotRouter.delete('/Election/:id/ballots', asyncHandler(deleteAllBallotsForElectionID))

/** 
 * @swagger
 * /Election/{id}/ballot/{ballot_id}:
 *   get:
 *     summary: Get ballot by ballot ID
 *     tags: [Ballots]
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
ballotRouter.get('/Election/:id/ballot/:ballot_id', asyncHandler(getBallotByBallotID))

/** 
 * @swagger
 * /Election/{id}/vote:
 *   post:
 *     summary: Cast a vote in an election
 *     tags: [Ballots]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The election ID
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *           type: object
 *           properties:
 *            ballot:
 *              type: object
 *              $ref: '#/components/schemas/Ballot'
 *            recieptEmail:
 *              oneOf:
 *               - type: string
 *               - type: null 
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
ballotRouter.post('/Election/:id/vote', asyncHandler(castVoteController))

