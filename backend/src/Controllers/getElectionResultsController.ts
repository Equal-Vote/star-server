import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { BadRequest } from "@curveball/http-errors";
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
import { ILoggingContext } from "../Services/Logging/ILogger";
import { Election } from "../../../domain_model/Election";
import { Uid } from "../../../domain_model/Uid";

type CachedElectionResults = {
    results:any,
    expireTimeAsMS:number
}

const StarResults = require('../Tabulators/StarResults.js');
const BallotModel = ServiceLocator.ballotsDb();

const _cachedResults:Map<Uid,CachedElectionResults> = new Map();
const _resultsTimeToLiveAsMS = 5 * 60 * 1000;

const getElectionResults = async (req: any, res: any, next: any) => {
    const electionId:Uid = req.election.election_id;
    Logger.info(req, `getElectionResults: ${electionId}`);

    var resultsWithExpiry = _cachedResults.get(electionId);
    const nowAsMS = Date.now();
    if (resultsWithExpiry){
        if (resultsWithExpiry.expireTimeAsMS < nowAsMS){
            resultsWithExpiry = undefined;
        }
    }
    if (!resultsWithExpiry){
        const results = await calculateResults(req, req.election);
        const expireTime =  nowAsMS + _resultsTimeToLiveAsMS;
        resultsWithExpiry = {
            results:results,
            expireTimeAsMS: expireTime
        };
        _cachedResults.set(electionId, resultsWithExpiry);
    }
    res.json(
        {
            Election: req.election,
            Results: resultsWithExpiry.results
        }
    )
}

async function calculateResults(ctx:ILoggingContext, election:Election):Promise<any> {
    const electionId = election.election_id;
    const ballots = await BallotModel.getBallotsByElectionID(String(electionId), ctx);
    if (!ballots) {
        const msg = `Ballots not found for Election ${electionId}`;
        Logger.info(ctx, msg);
        throw new BadRequest(msg);
    }

    const candidateNames = election.races[0].candidates.map((Candidate: any) => (Candidate.candidate_name))
    const cvr = ballots.map((ballot: Ballot) => (
        ballot.votes[0].scores.map((score: Score) => (
            score.score
        ))
    ))
    const num_winners = election.races[0].num_winners
    const results = StarResults(candidateNames, cvr, num_winners);
    return results;
}

module.exports = {
    getElectionResults
}
