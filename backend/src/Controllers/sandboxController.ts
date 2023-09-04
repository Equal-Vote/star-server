import Logger from '../Services/Logging/Logger';
const className = "Elections.Controllers";
import { VotingMethods } from '../Tabulators/VotingMethodSelecter'
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
    let results = VotingMethods[voting_method](candidateNames, cvr, num_winners)
    res.json(
        {
            results: results,
            votingMethod: voting_method
        }
    );
}

module.exports = {
    getSandboxResults
}