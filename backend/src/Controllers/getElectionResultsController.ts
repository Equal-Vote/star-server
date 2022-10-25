import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { BadRequest } from "@curveball/http-errors";
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';

import { Star } from "../Tabulators/Star";
import { Approval } from "../Tabulators/Approval";
import { Plurality } from "../Tabulators/Plurality";
const AllocatedScoreResults = require('../Tabulators/AllocatedScore')

const BallotModel = ServiceLocator.ballotsDb();

const getElectionResults = async (req: any, res: any, next: any) => {
    var electionId = req.election.election_id;
    Logger.info(req, `getElectionResults: ${electionId}`);
    const ballots = await BallotModel.getBallotsByElectionID(String(electionId), req);
    if (!ballots) {
        const msg = `Ballots not found for Election ${electionId}`;
        Logger.info(req, msg);
        throw new BadRequest(msg);
    }

    const election = req.election
    let results = []
    for (let race_index = 0; race_index < election.races.length; race_index++) {
        const candidateNames = election.races[race_index].candidates.map((Candidate: any) => (Candidate.candidate_name))
        const race_id = election.races[race_index].race_id
        const cvr: number[][] = []
        ballots.forEach((ballot: Ballot) => {
            const vote = ballot.votes.find((vote) => vote.race_id===race_id)
            if (vote){
                cvr.push(vote.scores.map((score: Score) => (
                    score.score
                )))
            }
        })
        const num_winners = election.races[race_index].num_winners
        const voting_method = election.races[race_index].voting_method
        if (voting_method === 'STAR') {
            results[race_index] = Star(candidateNames, cvr, num_winners)
        }
        else if (voting_method === 'STAR-PR') {
            results[race_index] = AllocatedScoreResults(candidateNames, cvr, num_winners)
        }
        else if (voting_method === 'Approval') {
            results[race_index] = Approval(candidateNames, cvr, num_winners)
        }
        else if (voting_method === 'Plurality') {
            results[race_index] = Plurality(candidateNames, cvr, num_winners)
        }
        else {
            throw new Error('Invalid Voting Method')
        }
    }
    res.json(
        {
            Election: election,
            Results: results
        }
    )
}

module.exports = {
    getElectionResults
}
