const ParseData = require("./ParseData");

module.exports = function StarResults(candidates, votes, nWinners = 1) {
  const parsedData = ParseData(votes)
  const summaryData = getSummaryData(candidates, parsedData)
  const results = {
    elected: [],
    other: [],
    round_results: [],
    summaryData: summaryData,
  }
  // get candidate indexes
  var remainingCandidates = [...summaryData.candidates]
  for (let round = 0; round < candidates.length; round++) {
    const round_results = runStarRound(summaryData, remainingCandidates)
    if (results.elected.length < nWinners) {
      results.elected.push(...round_results.winners)
      results.round_results.push(round_results)
    }
    else {
      results.other.push(...round_results.winners)

    }
    remainingCandidates = remainingCandidates.filter(c => !round_results.winners.includes(c))
  }
  results.summaryData = sortData(summaryData, results.elected.concat(results.other))
  return results
}

function getSummaryData(candidates, parsedData) {
  // Initialize summary data structures
  const nCandidates = candidates.length
  const totalScores = Array(nCandidates)
  for (let i = 0; i < nCandidates; i++) {
    totalScores[i] = { index: i, score: 0 };
  }
  const scoreHist = Array(nCandidates);
  for (let i = 0; i < nCandidates; i++) {
    scoreHist[i] = Array(6).fill(0);
  }
  const preferenceMatrix = Array(nCandidates);
  const pairwiseMatrix = Array(nCandidates);
  for (let i = 0; i < nCandidates; i++) {
    preferenceMatrix[i] = Array(nCandidates).fill(0);
    pairwiseMatrix[i] = Array(nCandidates).fill(0);
  }
  let nBulletVotes = 0
  // Iterate through ballots, 
  parsedData.scores.forEach((vote) => {
    let nSupported = 0
    for (let i = 0; i < nCandidates; i++) {
      totalScores[i].score += vote[i]
      scoreHist[i][vote[i]] += 1
      for (let j = 0; j < nCandidates; j++) {
        if (!(i == j)) {
          if (vote[i] > vote[j]) {
            preferenceMatrix[i][j] += 1
          }
        }
      }
      if (vote[i] > 0) {
        nSupported += 1
      }
    }
    if (nSupported === 1) {
      nBulletVotes += 1
    }
  })

  for (let i = 0; i < nCandidates; i++) {
    for (let j = 0; j < nCandidates; j++) {
      if (preferenceMatrix[i][j] > preferenceMatrix[j][i]) {
        pairwiseMatrix[i][j] = 1
      }
      else if (preferenceMatrix[i][j] < preferenceMatrix[j][i]) {
        pairwiseMatrix[j][i] = 1
      }

    }
  }

  const candidatesWithIndexes = candidates.map((candidate, index) => ({ index: index, name: candidate }))
  return {
    candidates: candidatesWithIndexes,
    totalScores,
    scoreHist,
    preferenceMatrix,
    pairwiseMatrix,
    nValidVotes: parsedData.validVotes.length,
    nInvalidVotes: parsedData.invalidVotes.length,
    nUnderVotes: parsedData.underVotes.length,
    nBulletVotes: nBulletVotes
  }
}

function sortData(summaryData, order) {
  const indexOrder = order.map(c => c.index)
  const candidates = indexOrder.map(ind => (summaryData.candidates[ind]))
  candidates.forEach((c,i) => {
    c.index = i
  })
  const totalScores = indexOrder.map((ind, i) => ({index: i, score: summaryData.totalScores[ind].score}))
  const scoreHist = indexOrder.map((ind) => summaryData.scoreHist[ind])
  const preferenceMatrix = sortMatrix(summaryData.preferenceMatrix, indexOrder)
  const pairwiseMatrix = sortMatrix(summaryData.pairwiseMatrix, indexOrder)
  return {
    candidates,
    totalScores,
    scoreHist,
    preferenceMatrix,
    pairwiseMatrix,
    nValidVotes: summaryData.nValidVotes,
    nInvalidVotes: summaryData.nInvalidVotes,
    nUnderVotes: summaryData.nUnderVotes,
    nBulletVotes: summaryData.nBulletVotes,
  }
}

function runStarRound(summaryData, remainingCandidates) {
  const round_results = {
    winners: [],
    runner_up: [],
    logs: [],
  }
  if (remainingCandidates.length === 1) {
    round_results.winners.push(...remainingCandidates)
    return round_results
  }
  const runoffCandidates = []
  while (runoffCandidates.length < 2) {
    const eligibleCandidates = remainingCandidates.filter(c => !runoffCandidates.includes(c))
    const scoreWinners = getScoreWinners(summaryData, eligibleCandidates)
    if (scoreWinners.length === 1) {
      runoffCandidates.push(summaryData.candidates[scoreWinners[0].index])
      round_results.logs.push(`${scoreWinners[0].name} advances to the runoff round with a score of ${summaryData.totalScores[scoreWinners[0].index].score}.`)
    }
    else {
      round_results.logs.push(`${scoreWinners.map(c => summaryData.candidates[c.index].name).join(', ')} advances to score tiebreaker.`)
      const scoreTieWinners = runScoreTiebreaker(summaryData, scoreWinners)
      if (scoreTieWinners.length === 1) {
        runoffCandidates.push(scoreTieWinners[0])
        round_results.logs.push(`${scoreTieWinners[0].name} wins score tiebreaker and advances to the runoff round.`)
      }
      else {
        if (scoreTieWinners.length === 2 && runoffCandidates.length === 0) {
          runoffCandidates.push(...scoreTieWinners)
          round_results.logs.push(`${scoreTieWinners[0].name} and ${scoreTieWinners[1].name} win score tiebreaker and advances to the runoff round.`)
        }
        else {
          const randomWinner = scoreTieWinners[getRandomInt(scoreTieWinners.length)]
          round_results.logs.push(`True tie, ${randomWinner.name} wins random tiebreaker and advances to the runoff round.`)
          runoffCandidates.push(randomWinner)
        }
      }
    }
  }

  if (summaryData.pairwiseMatrix[runoffCandidates[0].index][runoffCandidates[1].index] === 1) {
    round_results.winners.push(runoffCandidates[0])
    round_results.runner_up.push(runoffCandidates[1])
    round_results.logs.push(`${runoffCandidates[0].name} defeats ${runoffCandidates[1].name} with ${summaryData.preferenceMatrix[runoffCandidates[0].index][runoffCandidates[1].index]} votes to ${summaryData.preferenceMatrix[runoffCandidates[1].index][runoffCandidates[0].index]}.`)
  }
  else if (summaryData.pairwiseMatrix[runoffCandidates[1].index][runoffCandidates[0].index] === 1) {
    round_results.winners.push(runoffCandidates[1])
    round_results.runner_up.push(runoffCandidates[0])
    round_results.logs.push(`${runoffCandidates[1].name} defeats ${runoffCandidates[0].name} with ${summaryData.preferenceMatrix[runoffCandidates[1].index][runoffCandidates[0].index]} votes to ${summaryData.preferenceMatrix[runoffCandidates[0].index][runoffCandidates[1].index]}.`)
  }
  else {
    const runoffTieWinner = runRunoffTiebreaker(summaryData, runoffCandidates)
    if (runoffTieWinner === 0) {
      round_results.winners = [runoffCandidates[0]]
      round_results.runner_up = [runoffCandidates[1]]
      round_results.logs.push(`${runoffCandidates[0].name} defeats ${runoffCandidates[1].name} in runoff tiebreaker with a score of ${summaryData.totalScores[runoffCandidates[0].index]} to ${summaryData.totalScores[runoffCandidates[1].index]}.`)
    }
    else if (runoffTieWinner === 1) {
      round_results.winners = [runoffCandidates[1]]
      round_results.runner_up = [runoffCandidates[0]]
      round_results.logs.push(`${runoffCandidates[1].name} defeats ${runoffCandidates[0].name} in runoff tiebreaker with a score of ${summaryData.totalScores[runoffCandidates[1].index]} to ${summaryData.totalScores[runoffCandidates[0].index]}.`)
    }
    else {
      const randomWinner = getRandomInt(2)
      round_results.winners = [runoffCandidates[randomWinner]]
      round_results.runner_up = [runoffCandidates[1 - randomWinner]]

      round_results.logs.push(`True tie, ${runoffCandidates[randomWinner].name} defeats ${runoffCandidates[1 - randomWinner].name} in random tiebreaker.`)
    }
  }
  return round_results
}

function getScoreWinners(summaryData, eligibleCandidates) {

  const eligibleCandidateScores = []
  eligibleCandidates.forEach((c) => eligibleCandidateScores.push(summaryData.totalScores[c.index]))
  const sortedScores = eligibleCandidateScores.sort((a, b) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
  })

  const topScore = sortedScores[0]
  const scoreWinners = [summaryData.candidates[topScore.index]]
  for (let i = 1; i < sortedScores.length; i++) {
    if (sortedScores[i].score === topScore.score) {
      scoreWinners.push(summaryData.candidates[sortedScores[i].index])
    }
  }
  return scoreWinners
}

function runScoreTiebreaker(summaryData, scoreWinners) {
  const condorcetWinners = [];
  scoreWinners.forEach(a => {
    let isWinner = true
    scoreWinners.forEach(b => {
      if (summaryData.pairwiseMatrix[b.index][a.index] === 1) {
        isWinner = false
      }
    })
    if (isWinner) condorcetWinners.push(a)
  })
  if (condorcetWinners.length === 1) return condorcetWinners
  else if (condorcetWinners.length === 0) return scoreWinners
  else return condorcetWinners
}

function runRunoffTiebreaker(summaryData, runoffCandidates) {
  if (summaryData.totalScores[runoffCandidates[0].index].score > summaryData.totalScores[runoffCandidates[1].index].score) {
    return 0
  }
  else if (summaryData.totalScores[runoffCandidates[0].index].score < summaryData.totalScores[runoffCandidates[1].index].score) {
    return 1
  }
  else {
    return null
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function sortMatrix(matrix, order) {
  var newMatrix = Array(order.length);
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
