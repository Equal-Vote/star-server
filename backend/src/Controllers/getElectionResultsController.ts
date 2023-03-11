import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { BadRequest } from "@curveball/http-errors";
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
import { expectPermission } from "./controllerUtils";
import { permissions } from '../../../domain_model/permissions';
import { VotingMethods } from '../Tabulators/VotingMethodSelecter'

const BallotModel = ServiceLocator.ballotsDb();

const getElectionResults = async (req: any, res: any, next: any) => {
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
    let results = []
    for (let race_index = 0; race_index < election.races.length; race_index++) {
        const candidateNames = election.races[race_index].candidates.map((Candidate: any) => (Candidate.candidate_name))
        const race_id = election.races[race_index].race_id
        const cvr: number[][] = []
        ballots.forEach((ballot: Ballot) => {
            const vote = ballot.votes.find((vote) => vote.race_id === race_id)
            if (vote) {
                cvr.push(vote.scores.map((score: Score) => (
                    score.score
                )))
            }
        })
        const num_winners = election.races[race_index].num_winners
        const voting_method = election.races[race_index].voting_method

        if (!VotingMethods[voting_method]) {
            throw new Error(`Invalid Voting Method: ${voting_method}`)
        }
        const msg = `Tabulating results for ${voting_method} election`
        Logger.info(req, msg);
        results[race_index] = VotingMethods[voting_method](candidateNames, cvr, num_winners)
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
