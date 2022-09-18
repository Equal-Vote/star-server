const ParseData = require("./ParseData");

module.exports = function PluralityResults(candidates, votes, nWinners = 1) {
  const parsedData = ParseData(votes, getPluralityBallotValidity)
  const summaryData = getSummaryData(candidates, parsedData)
  const results = {
    elected: [],
    summaryData: summaryData,
  }
  const sortedScores = summaryData.totalScores.sort((a, b) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
  })
  
  while (results.elected.length < nWinners) {
    const topScore = sortedScores[results.elected.length]
    const scoreWinners = [summaryData.candidates[topScore.index]]
    for (let i = results.elected.length+1; i < sortedScores.length; i++) {
      if (sortedScores[i].score === topScore.score) {
        scoreWinners.push(summaryData.candidates[sortedScores[i].index])
      }
    }
    if ((scoreWinners.length+results.elected.length)<=nWinners) {
      results.elected.push(...scoreWinners)
    }
    else {
      const randomShuffled = scoreWinners.sort(() => 0.5 - Math.random());
      results.elected.push(...randomShuffled.slice(0, nWinners - results.elected.length))
    }

  }
  
  return results;
}

function getSummaryData(candidates, parsedData) {
  // Initialize summary data structures
  const nCandidates = candidates.length
  const totalScores = Array(nCandidates)
  for (let i = 0; i < nCandidates; i++) {
    totalScores[i] = { index: i, score: 0 };
  }
  // Iterate through ballots, 
  parsedData.scores.forEach((vote) => {
    for (let i = 0; i < nCandidates; i++) {
      totalScores[i].score += vote[i]
    }
  })
  const candidatesWithIndexes = candidates.map((candidate, index) => ({ index: index, name: candidate }))
  return {
    candidates: candidatesWithIndexes,
    totalScores,
    nValidVotes: parsedData.validVotes.length,
    nInvalidVotes: parsedData.invalidVotes.length,
    nUnderVotes: parsedData.underVotes.length,
  }
}

function getPluralityBallotValidity(ballot) {
  const minScore = 0
  const maxScore = 1
  let isUnderVote = true
  let nSupported = 0
  for (let i = 0; i < ballot.length; i++) {
    if (ballot[i] < minScore || ballot[i] > maxScore) {
      return { isValid: false, isUnderVote: false }
    }
    if (ballot[i] > minScore) {
      isUnderVote = false
    }
    nSupported += ballot[i]
  }
  if (nSupported>1){
    return { isValid: false, isUnderVote: isUnderVote }
  }
  return { isValid: true, isUnderVote: isUnderVote }
}

