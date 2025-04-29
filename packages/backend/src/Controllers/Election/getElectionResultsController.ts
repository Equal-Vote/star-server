import ServiceLocator from "../../ServiceLocator";
import Logger from "../../Services/Logging/Logger";
import { BadRequest } from "@curveball/http-errors";
import { Ballot } from '@equal-vote/star-vote-shared/domain_model/Ballot';
import { Score } from '@equal-vote/star-vote-shared/domain_model/Score';
import { expectPermission } from "../controllerUtils";
import { permissions } from '@equal-vote/star-vote-shared/domain_model/permissions';
import { VotingMethods } from '../../Tabulators/VotingMethodSelecter';
import { IElectionRequest } from "../../IRequest";
import { Response, NextFunction } from 'express';
import { vote, ElectionResults, candidate, rawVote } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import { Candidate } from "@equal-vote/star-vote-shared/domain_model/Candidate";
var seedrandom = require('seedrandom');

const BallotModel = ServiceLocator.ballotsDb();

const getElectionResults = async (req: IElectionRequest, res: Response, next: NextFunction) => {
    var electionId = req.election.election_id;
    Logger.info(req, `getElectionResults: ${electionId}`);

    if (!req.election.settings.public_results) {
        expectPermission(req.user_auth.roles, permissions.canViewPreliminaryResults)
    }

    const ballots = await BallotModel.getBallotsByElectionID(String(electionId), req);
    if (!ballots) {
        const msg = `Ballots not found for Election ${electionId}`;
        Logger.info(req, msg);
        throw new BadRequest(msg);
    }

    const election = req.election
    let results: ElectionResults[] = []
    for (let race_index = 0; race_index < election.races.length; race_index++) {
        const candidates: candidate[] = election.races[race_index].candidates.map((c: Candidate, i) => ({
            id: c.candidate_id,
            name: c.candidate_name,
            // These will be set later
            tieBreakOrder: i,
            votesPreferredOver: {},
            winsAgainst: {}
        }))
        const race_id = election.races[race_index].race_id
        const cvr: rawVote[] = []
        const num_winners = election.races[race_index].num_winners
        const voting_method = election.races[race_index].voting_method
        ballots.forEach((ballot: Ballot) => {
            const vote = ballot.votes.find((vote) => vote.race_id === race_id)
            if (vote) {
                cvr.push({
                    marks: Object.fromEntries(vote.scores.map(score => [score.candidate_id, score.score])),
                    overvote_rank: vote?.overvote_rank,
                    has_duplicate_rank: vote?.has_duplicate_rank,
                })
            }
        })

        if (!VotingMethods[voting_method]) {
            throw new Error(`Invalid Voting Method: ${voting_method}`)
        }
        const msg = `Tabulating results for ${voting_method} election`
        Logger.info(req, msg);
        results[race_index] = VotingMethods[voting_method](candidates, cvr, num_winners, election.settings)
    }
    
    res.json(
        {
            election: election,
            results: results
        }
    )
}

export {
    getElectionResults
}
