export type score = number

export type ballot = score[]

export type ballots = ballot[]

export interface candidate {
    index: number,
    name: string,
    tieBreakOrder: number,
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

type scoreHist = number[][]

type rankHist = number[][]

type preferenceMatrix = number[][]

type pairwiseMatrix = number[][]

interface genericSummaryData {
    candidates: candidate[],
    totalScores: totalScore[],
    nValidVotes: number,
    nInvalidVotes: number,
    nUnderVotes: number,
    nBulletVotes?: number
}

export interface starSummaryData extends genericSummaryData {
    scoreHist: scoreHist,
    preferenceMatrix: preferenceMatrix,
    pairwiseMatrix: pairwiseMatrix,
    noPreferenceStars: number[],
}

export interface allocatedScoreSummaryData extends starSummaryData {
    splitPoints: number[],
    spentAboves: number[],
    weight_on_splits: number[],
    weightedScoresByRound: number[][]
}

export interface methodOfEqualSharesSummaryData extends genericSummaryData {
}

export interface approvalSummaryData extends genericSummaryData { }

export interface pluralitySummaryData extends genericSummaryData { }

export interface rankedRobinSummaryData extends genericSummaryData {
    rankHist: rankHist,
    preferenceMatrix: preferenceMatrix,
    pairwiseMatrix: pairwiseMatrix,
}

export interface irvSummaryData extends rankedRobinSummaryData { }

export type tabulatorLog = string | tabulatorLogObject;

interface tabulatorLogObject {
    key: string,
    [key: string]: string | number | string[]
}

type tieBreakType = 'none' | 'score' | 'five_star' | 'random';
export interface roundResults {
    winners: candidate[],
    runner_up: candidate[],
    tied: candidate[],
    tieBreakType: tieBreakType,
    logs: tabulatorLog[],
}

interface genericResults {
    elected: candidate[],
    tied: candidate[],
    other: candidate[],
    roundResults: roundResults[],
    summaryData: genericSummaryData,
    tieBreakType: tieBreakType,
}

export interface starResults extends genericResults {
    summaryData: starSummaryData,
}

export interface allocatedScoreResults extends Omit<genericResults, 'tied'> {
    tied: candidate[][],
    summaryData: allocatedScoreSummaryData,
}

export interface methodOfEqualSharesResults extends genericResults {
  summaryData: methodOfEqualSharesSummaryData
}

export interface approvalResults extends genericResults {
    summaryData: approvalSummaryData,
}

export interface pluralityResults extends genericResults {
    summaryData: pluralitySummaryData,
}

export interface rankedRobinResults extends genericResults {
    summaryData: rankedRobinSummaryData,
}

export interface irvRoundResults {
    winners: candidate[],
    eliminated: candidate[],
    logs: string[],
}

export interface irvResults extends Omit<genericResults, 'roundResults'> {
    summaryData: rankedRobinSummaryData,
    roundResults: irvRoundResults[],
    logs: string[],
    voteCounts: number[][],
    exhaustedVoteCounts: number[],
    overVoteCounts: number[]
}

export type ElectionResults = {
    votingMethod: 'STAR',
    results: starResults,
} | {
    votingMethod: 'STAR_PR',
    results: allocatedScoreResults
} | {
    votingMethod: 'Approval',
    results: approvalResults
} | {
    votingMethod: 'RankedRobin',
    results: rankedRobinResults
} | {
    votingMethod: 'IRV',
    results: irvResults
} | {
    votingMethod: 'Plurality',
    results: pluralityResults
} | {
    votingMethod: 'STV',
    results: irvResults
}
