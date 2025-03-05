import { ElectionResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';
import Logger from '../../Services/Logging/Logger';
const className = "Elections.Controllers";
import { VotingMethods } from '../../Tabulators/VotingMethodSelecter'
import { Request, Response, NextFunction } from 'express';
import { STV } from '../../Tabulators/IRV';

const getSandboxResults = async (req: Request, res: Response, next: NextFunction) => {
    Logger.info(req, `${className}.getSandboxResults`);

    const candidateNames = req.body.candidates;
    let cvr = req.body.cvr;
    const num_winners = req.body.num_winners;
    const voting_method = req.body.votingMethod

    if (!VotingMethods[voting_method]) {
        throw new Error('Invalid Voting Method')
    }

    // Feels hacky to add overrank information as an additional column
    // but the other alternatives required updating the voting method inputs 
    // and that would need refactors to all methods
    if(voting_method == 'IRV' || voting_method == 'STV'){
        cvr = cvr.map((row:any) => ([...row, null]));
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