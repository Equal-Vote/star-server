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


export interface genericSummaryData {
    candidates: candidate[],
    totalScores: totalScore[],
    preferenceMatrix: preferenceMatrix,
    pairwiseMatrix: pairwiseMatrix,
    // nVotes = nOutOfBoundsVotes + nAbstentions + nTallyVotes
    nOutOfBoundsVotes: number,
    nAbstentions: number,
    nTallyVotes: number,
}

export interface starSummaryData extends genericSummaryData {
    fiveStarCounts: fiveStarCount[],
}

export interface allocatedScoreSummaryData extends genericSummaryData {
    splitPoints: number[],
    spentAboves: number[],
    weight_on_splits: number[],
    weightedScoresByRound: number[][]
}
export interface approvalSummaryData extends genericSummaryData { }

export interface pluralitySummaryData extends genericSummaryData {
    nOvervotes: number
}

export interface rankedRobinSummaryData extends genericSummaryData {
    rankHist: rankHist,
}

export interface irvSummaryData extends rankedRobinSummaryData {}

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

export interface genericResults {
    votingMethod: votingMethod,
    elected: candidate[],
    tied: candidate[],
    other: candidate[],
    roundResults: roundResults[],
    summaryData: genericSummaryData,
    tieBreakType: tieBreakType,
}

export interface starResults extends genericResults {
    votingMethod: 'STAR',
    summaryData: starSummaryData,
}

export interface allocatedScoreResults extends Omit<genericResults, 'tied'> {
    votingMethod: 'STAR_PR',
    tied: candidate[][],
    summaryData: allocatedScoreSummaryData,
    logs: tabulatorLog[]
}

export interface approvalResults extends genericResults {
    votingMethod: 'Approval',
    summaryData: approvalSummaryData,
}

export interface pluralityResults extends genericResults {
    votingMethod: 'Plurality',
    summaryData: pluralitySummaryData,
}

export interface rankedRobinResults extends genericResults {
    votingMethod: 'RankedRobin',
    summaryData: rankedRobinSummaryData,
}

export interface irvRoundResults {
    winners: candidate[],
    eliminated: candidate[],
    logs: string[],
}

export interface irvResults extends Omit<genericResults, 'roundResults'> {
    votingMethod: 'IRV' | 'STV',
    summaryData: rankedRobinSummaryData,
    roundResults: irvRoundResults[],
    logs: string[],
    voteCounts: number[][],
    exhaustedVoteCounts: number[],
    nExhaustedViaOvervote: number,
    nExhaustedViaSkippedRank: number,
    nExhaustedViaDuplicateRank: number,
}

export type ElectionResults =
    starResults |
    allocatedScoreResults |
    approvalResults |
    rankedRobinResults | 
    irvResults |
    pluralityResults;

type votingMethod = 
    'STAR' |
    'STAR_PR' |
    'Approval' |
    'RankedRobin' |
    'IRV' |
    'STV' |
    'Plurality';