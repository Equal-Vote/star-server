import Logger from '../Services/Logging/Logger';
import { Star } from "../Tabulators/Star";
import { Approval } from "../Tabulators/Approval";
import { Plurality } from "../Tabulators/Plurality";
import { RankedRobin } from '../Tabulators/RankedRobin';
import { IRV } from '../Tabulators/IRV';
const AllocatedScoreResults = require('../Tabulators/AllocatedScore')
const className = "Elections.Controllers";

const getSandboxResults = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.getSandboxResults`);

    const candidateNames = req.body.candidates;
    const cvr = req.body.cvr;
    const num_winners = req.body.num_winners;
    const voting_method = req.body.votingMethod
    let results = {}
    if (voting_method==='STAR'){
        results = Star(candidateNames, cvr, num_winners)
    }
    else if (voting_method==='STAR-PR'){
        results = AllocatedScoreResults(candidateNames, cvr, num_winners)
    }
    else if (voting_method==='Approval'){
        results = Approval(candidateNames, cvr, num_winners)
    }
    else if (voting_method==='Plurality'){
        results = Plurality(candidateNames, cvr, num_winners)
    }
    else if (voting_method==='Ranked-Robin'){
        results = RankedRobin(candidateNames, cvr, num_winners)
    }
    else if (voting_method==='IRV'){
        results = IRV(candidateNames, cvr, num_winners)
    }
    else {
        throw new Error('Invalid Voting Method')
    }
    res.json(
        {
            Results: results,
            voting_method: voting_method
        }
    );
}

module.exports = {
    getSandboxResults
}