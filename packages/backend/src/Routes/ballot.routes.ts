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
const ballotRouter = Router();

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
ballotRouter.post('/Election/:id/ballot', asyncHandler(returnElection))

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
ballotRouter.get('/Election/:id/ballots', asyncHandler(getBallotsByElectionID))

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
ballotRouter.delete('/Election/:id/ballots', asyncHandler(deleteAllBallotsForElectionID))

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
ballotRouter.get('/Election/:id/ballot/:ballot_id', asyncHandler(getBallotByBallotID))

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
ballotRouter.post('/Election/:id/vote', asyncHandler(castVoteController))

