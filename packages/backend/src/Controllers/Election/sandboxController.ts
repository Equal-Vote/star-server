import { ElectionResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';
import Logger from '../../Services/Logging/Logger';
const className = "Elections.Controllers";
import { VotingMethods } from '../../Tabulators/VotingMethodSelecter'
import { Request, Response, NextFunction } from 'express';

const getSandboxResults = async (req: Request, res: Response, next: NextFunction) => {
    Logger.info(req, `${className}.getSandboxResults`);

    const candidateNames = req.body.candidates;
    const cvr = req.body.cvr;
    const num_winners = req.body.num_winners;
    const voting_method = req.body.votingMethod

    if (!VotingMethods[voting_method]) {
        throw new Error('Invalid Voting Method')
    }

    let results: ElectionResults = {
        votingMethod: voting_method,
        ...VotingMethods[voting_method](candidateNames, cvr, num_winners)
    }

    res.json(
        {
            results: results,
            nWinners: num_winners,
            candidates: candidateNames,
        }
    );
}

export {
    getSandboxResults
}