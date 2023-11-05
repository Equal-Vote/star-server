export type score = number

export type ballot = score[]

export type ballots = ballot[]

export interface candidate {
    index: number,
    name: string,
    tieBreakOrder: string,
}

export interface voter {
    csvRow: number
}
export interface totalScore {
    index: number,
    score: number,
}

export interface fiveStarCount {
    candidate: candidate,
    counts: number
}
export interface summaryData {
    candidates: candidate[],
    totalScores: totalScore[],
    scoreHist: number[][],
    preferenceMatrix: number[][],
    pairwiseMatrix: number[][],
    nValidVotes: number,
    nInvalidVotes: number,
    nUnderVotes: number,
    nBulletVotes: number
}

export interface allocatedScoreSummaryData {
    candidates: candidate[],
    totalScores: totalScore[],
    scoreHist: number[][],
    preferenceMatrix: number[][],
    pairwiseMatrix: number[][],
    nValidVotes: number,
    nInvalidVotes: number,
    nUnderVotes: number,
    nBulletVotes: number,
    splitPoints: number[],
    spentAboves: number[], 
    weight_on_splits: number[],
    weightedScoresByRound: number[][]
}
export interface approvalSummaryData {
    candidates: candidate[],
    totalScores: totalScore[],
    nValidVotes: number,
    nInvalidVotes: number,
    nUnderVotes: number,
    nBulletVotes: number
}
export interface pluralitySummaryData {
    candidates: candidate[],
    totalScores: totalScore[],
    nValidVotes: number,
    nInvalidVotes: number,
    nUnderVotes: number,
}

export interface rankedRobinSummaryData {
    candidates: candidate[],
    totalScores: totalScore[],
    rankHist: number[][],
    preferenceMatrix: number[][],
    pairwiseMatrix: number[][],
    nValidVotes: number,
    nInvalidVotes: number,
    nUnderVotes: number,
    nBulletVotes: number
}
export interface irvSummaryData {
    candidates: candidate[],
    totalScores: totalScore[],
    rankHist: number[][],
    preferenceMatrix: number[][],
    pairwiseMatrix: number[][],
    nValidVotes: number,
    nInvalidVotes: number,
    nUnderVotes: number,
    nBulletVotes: number
}
export interface roundResults {
    winners: candidate[],
    runner_up: candidate[],
    logs: string[],
}

export interface results {
    elected: candidate[],
    tied: candidate[],
    other: candidate[],
    roundResults: roundResults[],
    summaryData: summaryData,
}
export interface allocatedScoreResults {
    elected: candidate[],
    tied: candidate[][],
    other: candidate[],
    roundResults: roundResults[],
    summaryData: allocatedScoreSummaryData,
}

export interface approvalResults {
    elected: candidate[],
    tied: candidate[],
    other: candidate[],
    roundResults: roundResults[],
    summaryData: approvalSummaryData,
}
export interface pluralityResults {
    elected: candidate[],
    tied: candidate[],
    other: candidate[],
    roundResults: roundResults[],
    summaryData: pluralitySummaryData,
}
export interface rankedRobinResults {
    elected: candidate[],
    tied: candidate[],
    other: candidate[],
    roundResults: roundResults[],
    summaryData: rankedRobinSummaryData,
}
export interface irvResults {
    elected: candidate[],
    tied: candidate[],
    other: candidate[],
    summaryData: rankedRobinSummaryData,
    logs: string[],
    voteCounts: number[][],
    exhaustedVoteCounts: number[],
    overVoteCounts: number[]
}