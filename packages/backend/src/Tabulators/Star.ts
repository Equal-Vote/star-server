import { candidate, fiveStarCount, starResults, roundResults, starSummaryData, totalScore, starCandidate, vote, rawVote } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { getInitialData, makeAbstentionTest, makeBoundsTest, runBlocTabulator } from "./Util";
import { ElectionSettings } from "@equal-vote/star-vote-shared/domain_model/ElectionSettings";
import { getEntry } from "@equal-vote/star-vote-shared/domain_model/Util";
export function Star(candidates: starCandidate[], votes: rawVote[], nWinners = 1, electionSettings?:ElectionSettings) {
  const [tallyVotes, initialSummaryData] = getInitialData<Omit<starSummaryData, 'fiveStarCounts'>>(
		votes, candidates, randomTiebreakOrder, 'cardinal',
		[
			makeBoundsTest(0, 5),
			makeAbstentionTest(null),
		]
	)

  let summaryData = {
    ...initialSummaryData,
    fiveStarCounts: initialSummaryData.candidates.map(candidate => ({
      candidate,
      counts: tallyVotes.filter(ballot => ballot[candidate.index] == 5).length
    } as fiveStarCount))
  } as starSummaryData;

  return runBlocTabulator<starResults, starSummaryData>(
    {
      votingMethod: 'STAR',
      elected: [],
      tied: [],
      other: [],
      roundResults: [],
      summaryData: summaryData,
      tieBreakType: 'none',
    } as starResults,
    nWinners,
    singleWinnerStar,
    // TODO: this uses index as the primary identifier, but we want to change this to id
    // TODO: I want to store totalScores within the candidate object, then we can remove summaryData as an input
    (candidate: candidate, roundResults: roundResults[], summaryData: starSummaryData) => ([
      // sort first by winning round
      roundResults.findIndex(round => round.winners[0].index == candidate.index),
      // then by runner_up round
      roundResults.findIndex(round => round.runner_up[0].index == candidate.index),
      // then by totalScore
      summaryData.totalScores.find(score => score.index == candidate.index)?.score ?? 0
    ])
  )
}

export function singleWinnerStar(remainingCandidates: candidate[], summaryData: starSummaryData): roundResults {
// Initialize output results data structure
  const roundResults: roundResults = {
    winners: [],
    runner_up: [],
    tied: [],
    tieBreakType: 'none',
    logs: [],
  }

  // If only one candidate remains, mark as winner
  if (remainingCandidates.length === 1) {
    roundResults.winners.push(...remainingCandidates)
    return roundResults
  }

  // Score round
  // Iterate through remaining candidates looking for two top scoring candidates to advance to runoff round
  // In most elections this is a simple process, but for cases where there are ties we advance one candidate at a time
  // and resolve ties as they occur
  const finalists: candidate[] = []
  outerLoop: while (finalists.length < 2) {
    const nCandidatesNeeded = 2 - finalists.length
    const eligibleCandidates = remainingCandidates.filter(c => !finalists.includes(c))
    const scoreWinners = getScoreWinners(summaryData, eligibleCandidates) // returns all winners tied for first place

    if (scoreWinners.length <= nCandidatesNeeded) {
      // when scoreWinners is less than candidate needed, but all can advance to runoff
      finalists.push(...scoreWinners.map(sc => getEntry(summaryData.candidates, sc.index, 'index')))
      scoreWinners.forEach(scoreWinner =>
        roundResults.logs.push({
          key: 'tabulation_logs.star.score_tiebreak_advance_to_runoff',
          name: scoreWinner.name,
          score: getEntry(summaryData.totalScores, scoreWinner.index, 'index').score
        })
      )
      continue outerLoop
    }
    // Multiple candidates have top score, proceed to score tiebreaker
    roundResults.logs.push({
      // TODO: i18n should infer one vs two automatically from count, not sure why it's not working
      key: `tabulation_logs.star.scoring_round_tiebreaker_start_${(finalists.length+1) == 1 ? 'one' : 'two'}`,
      names: scoreWinners.map(c => c.name),
      score: getEntry(summaryData.totalScores, scoreWinners[0].index, 'index').score,
      count: finalists.length+1,
    });

    let tiedCandidates = scoreWinners
    pairwiseLoop: while (tiedCandidates.length > 1) {
      // Get candidates with the most head to head losses
      let {headToHeadLosers, losses} = getHeadToHeadLosers(summaryData, tiedCandidates)
      if (headToHeadLosers.length < tiedCandidates.length) {
        // Some candidates have more head to head losses than others, remove them from the tied candidate pool
        headToHeadLosers.forEach(c => 
          roundResults.logs.push({
            key: 'tabulation_logs.star.pairwise_tiebreak_remove_candidate',
            name: c.name,
            count: losses,
            n_tied_candidates: tiedCandidates.length
          })
        )
        tiedCandidates = tiedCandidates.filter(c => !headToHeadLosers.includes(c))
        continue pairwiseLoop
      }
      // All tied candidates have the same number of head to head lossess
      if (nCandidatesNeeded === 2 && tiedCandidates.length === 2) {
        // Tie between two candidates, but both can advance to runoff
        tiedCandidates.forEach(c => {
          roundResults.logs.push({
            key: 'tabulation_logs.star.pairwise_tiebreak_advance_to_runoff',
            names: c.name,
            count: losses,
            n_tied_candidates: tiedCandidates.length
          })
          finalists.push(c)
        })
        continue outerLoop
      }
      // Proceed to five star tiebreaker
      roundResults.logs.push({
        key: 'tabulation_logs.star.pairwise_tiebreak_end',
        names: tiedCandidates.map(c => c.name),
        count: losses,
      })

      let fiveStarCounts = getFiveStarCounts(summaryData,tiedCandidates);
      if (nCandidatesNeeded === 2 && fiveStarCounts[1].counts > fiveStarCounts[2].counts) {
        // Two candidates needed and first two have more five star counts than the rest, advance them both to runoff
        fiveStarCounts.slice(0, 2).map((fiveStarCount) => 
          roundResults.logs.push({
            key: 'tabulation_logs.star.five_star_tiebreak_advance_to_runoff',
            name: fiveStarCount.candidate.name,
            five_star_count: fiveStarCount.counts,
          })
        );
        finalists.push(fiveStarCounts[0].candidate)
        finalists.push(fiveStarCounts[1].candidate)
        continue outerLoop
      }
      if (fiveStarCounts[0].counts > fiveStarCounts[1].counts) {
        // First has more five star counts than the rest, advance them to runoff
        roundResults.logs.push({
          key: 'tabulation_logs.star.five_star_tiebreak_advance_to_runoff',
          name: fiveStarCounts[0].candidate.name,
          five_star_count: fiveStarCounts[0].counts,
        });
        finalists.push(fiveStarCounts[0].candidate)
        continue outerLoop
      }

      // No five star winner, try to find five star losers instead
      let fiveStarLoserCounts = getFiveStarLosers(fiveStarCounts)
      if (fiveStarLoserCounts.length < tiedCandidates.length) {
        // Some candidates have fewer five star votes than others, remove them from the tie breaker pool
        fiveStarLoserCounts.forEach(fiveStarCount => 
          roundResults.logs.push({
            key: 'tabulation_logs.star.five_star_tiebreak_remove_candidate',
            name: fiveStarCount.candidate.name,
            five_star_count: fiveStarCount.counts,
          })
        )
        tiedCandidates = tiedCandidates.filter(c => !fiveStarLoserCounts.map(f => f.candidate).includes(c))
        continue pairwiseLoop
      }

      roundResults.logs.push({
        key: 'tabulation_logs.star.five_star_tiebreak_end',
        names: fiveStarCounts.map(fiveStarCount => fiveStarCount.candidate.name),
        five_star_count: fiveStarCounts[0].counts,
      });

      // True tie. Break tie randomly
      const randomWinner = sortByTieBreakOrder(tiedCandidates)[0]
      roundResults.logs.push({
        key: 'tabulation_logs.star.random_tiebreak_advance_to_runoff',
        name: randomWinner.name
      })
      finalists.push(randomWinner)
      continue outerLoop
    }


    // NOTE: we can only get here if the tiedCandidates.length > 1 condition fails
    //       so we know there's exactly one tied candidate
    roundResults.logs.push({
      // TODO: i18n should infer one vs two automatically from count, not sure why it's not working
      key: `tabulation_logs.star.tiebreak_advance_${finalists.length+1 == 1 ? 'one' : 'two'}`,
      count: finalists.length+1,
      name: tiedCandidates[0].name,
    });
    finalists.push(tiedCandidates[0])
  }

  // votes with preference to 0 over 1
  const leftVotes = summaryData.preferenceMatrix[finalists[0].index][finalists[1].index]
  // votes with preference to 1 over 0
  const rightVotes = summaryData.preferenceMatrix[finalists[1].index][finalists[0].index]
  const noPrefVotes = summaryData.nTallyVotes - leftVotes - rightVotes;

  roundResults.logs.push({
      key: 'tabulation_logs.star.automatic_runoff_start',
      candidate_a: finalists[0].name,
      candidate_b: finalists[1].name,
  })

  if (leftVotes > rightVotes){
    // First candidate wins runoff
    roundResults.winners.push(finalists[0])
    roundResults.runner_up.push(finalists[1])
    roundResults.logs.push({
      key: 'tabulation_logs.star.automatic_runoff_win',
      winner: finalists[0].name,
      loser: finalists[1].name,
      winner_votes: leftVotes,
      loser_votes: rightVotes,
      equal_votes: noPrefVotes,
    })
    return roundResults
  }
  if (leftVotes < rightVotes) {
    // Second candidate wins runoff
    roundResults.winners.push(finalists[1])
    roundResults.runner_up.push(finalists[0])
    roundResults.logs.push({
      key: 'tabulation_logs.star.automatic_runoff_win',
      winner: finalists[1].name,
      loser: finalists[0].name,
      winner_votes: rightVotes,
      loser_votes: leftVotes,
      equal_votes: noPrefVotes,
    })
    return roundResults
  }
  roundResults.logs.push({
    key: 'tabulation_logs.star.automatic_runoff_tie',
    names: finalists.map(f => f.name),
    tied_votes: rightVotes, // right or left doesn't matter
    equal_votes: noPrefVotes,
  })

  roundResults.logs.push({
    key: 'tabulation_logs.star.runoff_round_tiebreaker_start',
    names: finalists.map(f => f.name),
  });

  // Tie, run runoff tiebreaker
  const runoffTieWinner = runRunoffTiebreaker(summaryData, finalists)
  if (runoffTieWinner !== null) {
    const winIndex = runoffTieWinner; 
    const loseIndex = 1 - runoffTieWinner;
    roundResults.winners = [finalists[winIndex]]
    roundResults.runner_up = [finalists[loseIndex]]
    roundResults.logs.push({
      key: 'tabulation_logs.star.score_tiebreak_win_runoff',
      winner: finalists[winIndex].name,
      loser: finalists[loseIndex].name,
      winner_score: summaryData.totalScores[finalists[winIndex].index].score,
      loser_score: summaryData.totalScores[finalists[loseIndex].index].score,
    })
    roundResults.tieBreakType = 'score';
    return roundResults
  }
  // Tie between scores, other tiebreaker needed to resolve
  roundResults.logs.push({
    key: 'tabulation_logs.star.score_tiebreak_end',
    names: finalists.map(f => f.name),
    score: getEntry(summaryData.totalScores, finalists[0].index, 'index').score,
  })

  // Five-star tiebreaker is enabled, look for candidate with most 5 star votes
  const fiveStarCounts = getFiveStarCounts(summaryData,finalists);
  if (fiveStarCounts[0].counts != fiveStarCounts[1].counts){
    const winnerIndex = (fiveStarCounts[0].counts > fiveStarCounts[1].counts)? 0 : 1;
    const loserIndex = 1 - winnerIndex;
    roundResults.winners = [fiveStarCounts[winnerIndex].candidate]
    roundResults.runner_up = [fiveStarCounts[loserIndex].candidate]
    roundResults.logs.push({
      key: 'tabulation_logs.star.five_star_tiebreak_win_runoff',
      winner: fiveStarCounts[winnerIndex].candidate.name,
      loser: fiveStarCounts[loserIndex].candidate.name,
      winner_five_star_count: fiveStarCounts[winnerIndex].counts,
      loser_five_star_count: fiveStarCounts[loserIndex].counts,
    })
    roundResults.tieBreakType = 'five_star';
    return roundResults
  }

  // Could not resolve tie with five-star tiebreaker
  roundResults.logs.push({
    key: 'tabulation_logs.star.five_star_tiebreak_end',
    names: finalists.map(f => f.name),
    five_star_count: fiveStarCounts[0].counts // 0 or 1 doesn't matter
  });

  // Break tie randomly
  const sortedCandidates = sortByTieBreakOrder(finalists)
  roundResults.winners = [sortedCandidates[0]]
  roundResults.runner_up = [sortedCandidates[1]]
  roundResults.logs.push({
    key: 'tabulation_logs.star.random_tiebreak_win_runoff',
    winner: sortedCandidates[0].name,
    loser: sortedCandidates[1].name,
  });
  roundResults.tieBreakType = 'random';
  return roundResults
}

function getScoreWinners(summaryData: starSummaryData, eligibleCandidates: candidate[]) {
  // Searches for candidate(s) with highest score

  // Sort candidate total scores 
  const eligibleCandidateScores: totalScore[] = []
  eligibleCandidates.forEach((c) => eligibleCandidateScores.push(getEntry(summaryData.totalScores, c.index, 'index')))
  const sortedScores = eligibleCandidateScores.sort((a: totalScore, b: totalScore) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    return 0
  })

  // Return all candidates that tie for top score
  const topScore = sortedScores[0]
  const scoreWinners = [getEntry(summaryData.candidates, topScore.index, 'index')]
  for (let i = 1; i < sortedScores.length; i++) {
    if (sortedScores[i].score === topScore.score) {
      scoreWinners.push(getEntry(summaryData.candidates, sortedScores[i].index, 'index'))
    }
  }
  return scoreWinners
}

function runRunoffTiebreaker(summaryData: starSummaryData, runoffCandidates: candidate[]) {
  // Search for candidate with highest score between two runoff candidates
  if (getEntry(summaryData.totalScores, runoffCandidates[0].index, 'index').score > getEntry(summaryData.totalScores, runoffCandidates[1].index, 'index').score) {
    return 0
  }
  if (getEntry(summaryData.totalScores, runoffCandidates[0].index, 'index').score < getEntry(summaryData.totalScores, runoffCandidates[1].index, 'index').score) {
    return 1
  }
  return null
}

export function sortByTieBreakOrder(candidates: candidate[]) {
  return candidates.sort((a,b) => {
    if (a.tieBreakOrder < b.tieBreakOrder) return -1
    else return 1
  })
}

function getFiveStarLosers(fiveStarCounts: fiveStarCount[]) {
  let minCount = fiveStarCounts[fiveStarCounts.length - 1].counts
  let fiveStarLosers = fiveStarCounts.filter(fiveStarCount => fiveStarCount.counts === minCount)
  return fiveStarLosers;
}

function getHeadToHeadLosers(summaryData: starSummaryData, tiedCandidates: candidate[]) {
  // Search for candidates with most head to head losses
  let headToHeadLosers: candidate[] = []
  let maxLosses: number = 0
  tiedCandidates.forEach(a => {
    let nLosses = 0
    tiedCandidates.forEach(b => {
      nLosses += summaryData.pairwiseMatrix[b.index][a.index]
    })
    if (nLosses > maxLosses) {
      // Candidate a has the most current losses
      maxLosses = nLosses
      headToHeadLosers = [a]
    }
    else if (nLosses === maxLosses) {
      // Candidate a is tied for most losses
      headToHeadLosers.push(a)
    }
  })
  return {
    headToHeadLosers,
    losses: maxLosses,
  }
}

function getFiveStarCounts(summaryData: starSummaryData, tiedCandidates: candidate[]) {
  // Returns five star counts of tied candidates, sorted from most to least
  const fiveStarCounts: fiveStarCount[] = []
  tiedCandidates.forEach((candidate) => {
    fiveStarCounts.push(
      getEntry(summaryData.fiveStarCounts, candidate.index, (item: fiveStarCount) => item.candidate.index)
    )
  })
  fiveStarCounts.sort((a, b) => b.counts - a.counts)
  return fiveStarCounts
}