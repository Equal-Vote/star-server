import { ballot, tabulatorLog, candidate, starResults, roundResults, starSummaryData, totalScore, genericSummaryData } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { IparsedData } from './ParseData'
import { getSummaryData, totalScoreComparator } from "./Util";
const ParseData = require("./ParseData");

export function Star(
  candidates: string[],
  votes: ballot[],
  nWinners = 1,
  randomTiebreakOrder:number[] = [],
) {
  // Determines STAR winners for given election
  // Parameters: 
  // candidates: Array of candidate names
  // votes: Array of votes, size nVoters x Candidates
  // nWiners: Number of winners in election, defaulted to 1
  // randomTiebreakOrder: Array to determine tiebreak order. If empty or not same length as candidates, set to candidate indexes

  // Parse the votes for valid, invalid, and undervotes, and identifies bullet votes
  const parsedData = ParseData(votes)

  // Compress valid votes into data needed to run election including
  // total scores
  // score histograms
  // preference and pairwise matrices
  const summaryData:starSummaryData = {
    ...getSummaryData(
      candidates,
      parsedData,
      randomTiebreakOrder,
      'cardinal', (a, b) => 
        totalScoreComparator('score', a, b) ??
        // a & b are swapped since this is sorted in the opposite direction
        totalScoreComparator('pairwiseLosesWithTiedScore', b, a) ?? 
        totalScoreComparator('maxSupportCount', a, b),
      5
    ),
    // this will be used later
    noPreferenceStars: [],
  }

  // Initialize output data structure
  const results: starResults = {
    elected: [],
    tied: [],
    other: [],
    roundResults: [],
    summaryData: summaryData,
    tieBreakType: 'none',
  }

  let scoresLeft = [...summaryData.totalScores];

  for(let w = 0; w < nWinners; w++){
    let {roundResults, tieBreakType, tiedCandidates} = singleWinnerSTAR(
      scoresLeft,
      summaryData,
    );

    results.elected.push(...roundResults.winners);
    results.roundResults.push(roundResults);

    scoresLeft = scoresLeft.filter(totalScore => totalScore.index != roundResults.winners[0].index)

    if(w == nWinners-1){
      results.tied = tiedCandidates; 
      results.tieBreakType = tieBreakType; // only save the tie breaker info if we're in the final round
    }
  }

  // NOTE: the proper way to handle no preferenceStars is to have a matrix of number[] in the summaryData. 
  //       BUT that's super overkill for the moment since we just need 6 values and we're not running multi-winner elections yet
  //       Also there's a chance we'll move advanced stats like this to an analytics api as some point
  //       So TLDR I think the current approach is good enough for now
  results.summaryData.noPreferenceStars = 
    getNoPreferenceStars(parsedData, results.roundResults[0].winners[0].index, results.roundResults[0].winners.length > 1?
      results.roundResults[0].winners[1].index :
      results.roundResults[0].runner_up[0].index
    );

  // Sort data in order of candidate placements
  results.summaryData = sortData(summaryData, results.elected.concat(results.tied).concat(results.other))
  return results
}

function getNoPreferenceStars(parsedData: IparsedData, cIndexI: number, cIndexJ: number): number[]{
  return parsedData.scores.reduce((stars, vote) => {
    if((vote[cIndexI] ?? 0) != (vote[cIndexJ] ?? 0)) return stars;
    stars[vote[cIndexI] ?? 0]++;
    return stars;
  }, Array(6).fill(0));
}

export const singleWinnerSTAR = (scoresLeft: totalScore[], summaryData: starSummaryData) => {
  let logs: tabulatorLog[] = [];

  const preferenceMatrix = summaryData.preferenceMatrix;
  const candidates = summaryData.candidates;
  const nValidVotes = summaryData.nValidVotes;

  const appendScoringLogs = () => {
    // Note: since scoresLeft is already sorted, we safely assume who the weakestWinner & strongest loser's are
    const weakestWinner = scoresLeft[1] as totalScore;
    const strongestLoser = scoresLeft[2] as totalScore;
    let winnersSelected = 0;
    let scorePool = [...scoresLeft];

    // SCORING: Remove Losers
    while(scorePool.length > 0 && (scorePool.at(-1)?.score ?? 0) < weakestWinner.score){
      scorePool.pop();
      // Note: we don't have to log these since it's obvious in the results page
    }

    // SCORING: Advance Winners
    // Note: Long term I will only need to include the null check on strongest loser here, because future areas will can only 
    //       be reached in a 3 candidate race, so strongestLoser is guarnateed to be defined
    while(scorePool.length > 0 && scorePool[0].score > (strongestLoser?.score ?? 0)){
      let selected = scorePool.shift() as totalScore;
      winnersSelected++;
      logs.push({
        key: 'tabulator_logs.star.score_tiebreak_advance_to_runoff',
        name: candidates[selected.index].name,
        score: selected.score
      })
    }
    if(winnersSelected == 2) return;

    // SCORING: Output Ties
    logs.push({
      key: 'tabulator_logs.star.score_tiebreak_end',
      names: scorePool.map(totalScore => candidates[totalScore.index].name),
      score: weakestWinner.score
    });

    // PAIRWISE TIEBREAK: Remove Losers
    logs.push({ key: 'tabulator_logs.star.pairwise_tiebreak_start' })
    while(scorePool.length > 0 && 
      // Note: once we make pairwiseLosesWithTiedScore a required part of summary data we can remove the null checks
      (scorePool.at(-1)?.pairwiseLosesWithTiedScore ?? 0) > (weakestWinner?.pairwiseLosesWithTiedScore ?? 0)
    ){
      let removed = scorePool.pop() as totalScore;
      logs.push({
        key: 'tabulator_logs.star.pairwise_tiebreak_remove_candidate',
        name: candidates[removed.index].name,
        pairwise_loses: removed?.pairwiseLosesWithTiedScore ?? 0
      });
    }

    // PAIRWISE TIEBREAK: Advance Winners
    while(scorePool.length > 0 && 
      // Note: once we make pairwiseLosesWithTiedScore a required part of summary data we can remove the null checks
      // compare top of tied list to the tied candidate outside the winner window
      (scorePool[0]?.pairwiseLosesWithTiedScore ?? 0) < (strongestLoser?.pairwiseLosesWithTiedScore ?? 0)
    ){
      let selected = scorePool.shift() as totalScore;
      winnersSelected++;
      logs.push({
        key: 'tabulator_logs.star.pairwise_tiebreak_advance_to_runoff',
        name: candidates[selected.index].name,
        pairwise_loses: selected?.pairwiseLosesWithTiedScore ?? 0
      })
    }
    if(winnersSelected == 2) return;

    // PAIRWISE TIEBREAK: Output Ties
    logs.push({
      key: 'tabulator_logs.star.pairwise_tiebreak_end',
      names: scorePool.map(totalScore => candidates[totalScore.index].name),
      pairwise_loses: weakestWinner?.pairwiseLosesWithTiedScore ?? 0
    });

    // 5-STAR TIEBREAK: Remove Losers
    logs.push({ key: 'tabulator_logs.star.five_star_tiebreak_start' })
    while(
      scorePool.length > 0 &&
      // Note: once we make maxSupportCount a required part of summary data we can remove the null checks
      (scorePool.at(-1)?.maxSupportCount ?? 0) < (weakestWinner?.maxSupportCount ?? 0)
    ){
      let removed = scorePool.pop() as totalScore;
      logs.push({
        key: 'tabulator_logs.star.five_star_tiebreak_remove_candidate',
        name: candidates[removed.index].name,
        five_star_count: removed?.maxSupportCount ?? 0
      });
    }

    // 5-STAR TIEBREAK: Advance Winners
    while(
      scorePool.length > 0 &&
      // Note: once we make pairwiseLosesWithTiedScore a required part of summary data we can remove the null checks
      // compare top of tied list to the tied candidate outside the winner window
      (scorePool[0]?.maxSupportCount ?? 0) < (strongestLoser?.maxSupportCount ?? 0)
    ){
      let selected = scorePool.shift() as totalScore;
      winnersSelected++;
      logs.push({
        key: 'tabulator_logs.star.five_star_tiebreak_advance_to_runoff',
        name: candidates[selected.index].name,
        pairwise_loses: selected?.pairwiseLosesWithTiedScore ?? 0
      })
    }
    if(winnersSelected == 2) return;

    // 5-STAR TIEBREAK: Output Ties
    logs.push({
      key: 'tabulator_logs.star.five_star_tiebreak_end',
      names: scorePool.map(totalScore => candidates[totalScore.index].name),
      five_star_count: weakestWinner?.maxSupportCount ?? 0
    });

    // RANDOM TIE BREAK: Advance Winners
    logs.push({ key: 'tabulator_logs.star.random_tiebreak_start' })
    scorePool.slice(0, 2-winnersSelected).forEach(totalScore => 
      logs.push({
        key: 'tabulator_logs.star.random_tiebreak_advance_to_runoff',
        name: candidates[totalScore.index].name,
      })
    )
  }

  const appendRunoffLogs = (winnerScore: totalScore, loserScore: totalScore) => {
    const names = [winnerScore, loserScore].map(totalScore => candidates[totalScore.index].name);

    logs.push({ key: 'tabulator_logs.star.automatic_runoff_start' })

    // Preference Votes
    let winnerVotes = preferenceMatrix[winnerScore.index][loserScore.index]
    let loserVotes = preferenceMatrix[loserScore.index][winnerScore.index]
    let equalVotes = nValidVotes - winnerVotes - loserVotes;
    
    if(winnerVotes == loserVotes){
      logs.push({
        key: 'tabulator_logs.star.automatic_runoff_tie',
        names: names,
        tied_votes: winnerVotes, // loserVotes would work too
        equal_votes: equalVotes,
      });
    }else{
      logs.push({
        key: 'tabulator_logs.star.automatic_runoff_win',
        winner: names[0],
        loser: names[1],
        winner_votes: winnerVotes,
        loser_votes: loserVotes,
        equal_votes: equalVotes,
      });
      return;
    }

    // Score tiebreaker
    logs.push({ key: 'tabulator_logs.star.score_tiebreaker_start' });

    if(winnerScore.score == loserScore.score){
      logs.push({
        key: 'tabulator_logs.star.score_tiebreaker_end',
        names: names,
        score: winnerScore.score,
      });
    }else{
      logs.push({
        key: 'tabulator_logs.star.score_tiebreaker_win_runoff',
        winner: names[0],
        loser: names[1],
        winner_score: winnerScore.score,
        loser_score: loserScore.score,
      });
      return;
    }

    // 5-star tiebreaker
    logs.push({ key: 'tabulator_logs.star.five_star_tiebreaker_start' });

    if(winnerScore.maxSupportCount == loserScore.maxSupportCount){
      logs.push({
        key: 'tabulator_logs.star.five_star_tiebreaker_end',
        names: names,
        five_star_count: winnerScore?.maxSupportCount ?? 0,
      });
    }else{
      logs.push({
        key: 'tabulator_logs.star.five_star_tiebreaker_win_runoff',
        winner: names[0],
        loser: names[1],
        winner_five_star_count: winnerScore?.maxSupportCount ?? 0,
        loser_five_star_count: loserScore?.maxSupportCount ?? 0,
      });
      return;
    }

    // random tiebreaker
    logs.push({ key: 'tabulator_logs.star.random_tiebreaker_start' });
    logs.push({
      key: 'tabulator_logs.star.random_tiebreaker_win_runoff',
      winner: names[0],
      loser: names[1],
    });
  }

  appendScoringLogs();

  let [winnerScore, loserScore] = scoresLeft.slice(0, 2).sort((a, b) => {
    const winMargin = preferenceMatrix[a.index][b.index] - preferenceMatrix[b.index][a.index];
    if(winMargin > 0) return -1;
    if(winMargin < 0) return 1;
    return (
      totalScoreComparator('score', a, b) ??
      totalScoreComparator('maxSupportCount', a, b) ??
      (candidates[a.index].tieBreakOrder - candidates[b.index].tieBreakOrder)
    );
  });

  appendRunoffLogs(winnerScore, loserScore);

  console.log(logs)

  return {
    roundResults: {
      winners: [candidates[winnerScore.index]],
      runner_up: [candidates[loserScore.index]],
      logs: logs
    },
    tieBreakType: // Note: I'm not including the score tiebreaker in this
      (
        preferenceMatrix[winnerScore.index][loserScore.index] > preferenceMatrix[loserScore.index][winnerScore.index]
      ) ? 'none' :
      (winnerScore.score != loserScore.score) ? 'score' :
      (winnerScore.maxSupportCount != loserScore.maxSupportCount ) ? 'five_star' :
      'random',
    tiedCandidates: [] // not used?
  }
}


function sortData(summaryData: starSummaryData, order: candidate[]): starSummaryData {
  // sorts summary data to be in specified order
  const indexOrder = order.map(c => c.index)
  const candidates = indexOrder.map(ind => (summaryData.candidates[ind]))
  candidates.forEach((c, i) => {
    c.index = i
  })
  const totalScores = indexOrder.map((ind, i) => ({ index: i, score: summaryData.totalScores[ind].score }))
  const preferenceMatrix = sortMatrix(summaryData.preferenceMatrix, indexOrder)
  const pairwiseMatrix = sortMatrix(summaryData.pairwiseMatrix, indexOrder)
  return {
    candidates,
    totalScores,
    preferenceMatrix,
    pairwiseMatrix,
    nValidVotes: summaryData.nValidVotes,
    nInvalidVotes: summaryData.nInvalidVotes,
    nUnderVotes: summaryData.nUnderVotes,
    nBulletVotes: summaryData.nBulletVotes,
    noPreferenceStars: summaryData.noPreferenceStars,
  }
}

function sortMatrix(matrix: number[][], order: number[]) {
  var newMatrix: number[][] = Array(order.length);
  for (let i = 0; i < order.length; i++) {
    newMatrix[i] = Array(order.length).fill(0);
  }
  order.forEach((i, iInd) => {
    order.forEach((j, jInd) => {
      newMatrix[iInd][jInd] = matrix[i][j];
    });
  });
  return newMatrix
}