export type score = number

export type ballot = score[]

export type ballots = ballot[]

export interface candidate {
    index: number,
    name: string,
    tieBreakOrder: number,
}

export type tabulatorLog = string | tabulatorLogObject;

interface tabulatorLogObject {
    key: string,
    [key: string]: string | number | string[]
}

export interface voter {
    csvRow: number
}

export interface totalScore {
    index: number,
    score: number,
    // these are optional for now, but I'll make them required once all tabulators share the same summaryData
    pairwiseLosesWithTiedScore?: number,
    pairwiseWins?: number,
    maxSupportCount?: number,
}

export type totalScoreKey = keyof totalScore;

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
    nValidVotes: number,
    nInvalidVotes: number,
    nUnderVotes: number,
    nBulletVotes?: number,
}

export interface starSummaryData extends genericSummaryData {
    noPreferenceStars: number[],
}

export interface allocatedScoreSummaryData extends starSummaryData {
    splitPoints: number[],
    spentAboves: number[],
    weight_on_splits: number[],
    weightedScoresByRound: number[][],
    scoreHist: scoreHist,
}
export interface approvalSummaryData extends genericSummaryData { }

export interface pluralitySummaryData extends genericSummaryData { }

export interface rankedRobinSummaryData extends genericSummaryData {
    rankHist: rankHist,
}

export interface irvSummaryData extends rankedRobinSummaryData { }

type tieBreakType = 'none' | 'score' | 'five_star' | 'random';
export interface roundResults {
    winners: candidate[],
    runner_up: candidate[],
    logs: tabulatorLog[],
    tieBreakType: tieBreakType,
    tiedCandidates: candidate[],
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

export interface approvalResults extends genericResults {
    summaryData: approvalSummaryData,
}

export interface pluralityResults extends genericResults {
    summaryData: pluralitySummaryData,
}

export interface rankedRobinResults extends genericResults {
    summaryData: rankedRobinSummaryData,
}

// TODO: moving logs to the root makes it inflexible to a block-IRV scenario.
//       IRV should follow a similar rounds / logs pattern to the other methods
export interface irvResults extends Omit<genericResults, 'roundResults'> {
    summaryData: rankedRobinSummaryData,
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
}


