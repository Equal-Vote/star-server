import Logger from '../Services/Logging/Logger';
const StarResults = require('../Tabulators/StarResults.js');
const className = "Elections.Controllers";

const getSandboxResults = async (req: any, res: any, next: any) => {
    Logger.info(req, `${className}.getSandboxResults`);

    const candidateNames = req.body.candidates;
    const cvr = req.body.cvr;
    const num_winners = req.body.num_winners;
    Logger.debug(req, "Candidate names:  " + JSON.stringify(candidateNames));
    const results = StarResults(candidateNames, cvr, num_winners)
    res.json(
        {
            Results: results
        }
    );
}

module.exports = {
    getSandboxResults
}