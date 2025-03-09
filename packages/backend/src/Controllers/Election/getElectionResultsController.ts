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
import { ballot, ElectionResults } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
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
        const race = election.races[race_index]
        const candidateNames = race.candidates.map((Candidate: any) => (Candidate.candidate_name))
        const candidateIDs = race.candidates.map((Candidate: any) => (Candidate.candidate_id))
        const useWriteIns = race.enable_write_in && race.write_in_candidates && race.write_in_candidates.length>0
        const writeInCandidates = useWriteIns && race.write_in_candidates ? race.write_in_candidates : [] 
        const writeInCandidateNames = useWriteIns && race.write_in_candidates ? race.write_in_candidates.map(candidate => candidate.candidate_name) : []
        const number_of_candidates = candidateNames.length + writeInCandidateNames.length
        const race_id = race.race_id
        const cvr: ballot[] = []
        const num_winners = race.num_winners
        const voting_method = race.voting_method
        const fullCandidateNames = [...candidateNames,...writeInCandidateNames]

        ballots.forEach((ballot: Ballot) => {
            const vote = ballot.votes.find((vote) => vote.race_id === race_id)
            if (vote) {
                let row: ballot = new Array(number_of_candidates).fill(null)
                vote.scores.forEach(score => {
                    const candidateIndex = candidateIDs.indexOf(score.candidate_id)
                    if (candidateIndex >= 0) {
                        row[candidateIndex] = score.score
                    }
                    else if (useWriteIns && score.write_in_name) {
                        const write_in_name = score.write_in_name // typescript sees score.write_in_name as possibly undefined unless I extract it to another variable for some reason
                        const writeInCandidateIndex = writeInCandidates.findIndex(candidate => candidate.aliases.includes(write_in_name) && candidate.approved)
                        if (writeInCandidateIndex >= 0) {
                            row[writeInCandidateIndex + candidateNames.length] = score.score
                        }
                    }
                })

                // Feels hacky to add overrank information as an additional column
                // but the other alternatives required updating the voting method inputs 
                // and that would need refactors to all methods
                if(voting_method == 'IRV' || voting_method == 'STV'){
                    row = [...row, vote.overvote_rank ?? null];
                }
                cvr.push(row)
            }
        })

        if (!VotingMethods[voting_method]) {
            throw new Error(`Invalid Voting Method: ${voting_method}`)
        }
        const msg = `Tabulating results for ${voting_method} election`
        Logger.info(req, msg);
        let rng = seedrandom(election.election_id + ballots.length.toString())
        const tieBreakOrders = fullCandidateNames.map((Candidate) => (rng() as number))
        results[race_index] = {
            votingMethod: voting_method,
            ...VotingMethods[voting_method](fullCandidateNames, cvr, num_winners, tieBreakOrders, election.settings)
        }
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
