export type score = number

export type ballot = score[]

export type ballots = ballot[]

export interface candidate {
    index: number,
    name: string,
}

export interface voter {
    csvRow: number
}
export interface totalScore {
    index: number,
    score: number,
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