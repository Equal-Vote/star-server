export type keyedObject<T> = {[key: string]: T};

export type rawVote = {
    marks: keyedObject<number | null>; // candidate id => bubble value mapping
    overvote_rank?: number;
    has_duplicate_rank?: boolean;
}

export type vote = {
    marks: keyedObject<number>; // candidate id => bubble value mapping
    overvote_rank?: number;
    has_duplicate_rank?: boolean;
}

export interface candidate {
    id: string,
    name: string,
    tieBreakOrder: number,
    votesPreferredOver: keyedObject<number>,
    winsAgainst: keyedObject<boolean>,
}

export interface starCandidate extends candidate {
    score: number,
    fiveStarCount: number;
}

export interface approvalCandidate extends candidate {
    score: number,
}
export interface rankedRobinCandidate extends candidate {
    copelandScore: number,
}

export interface voter {
    csvRow: number
}

type rankHist = number[][]

export interface genericSummaryData<CandidateType extends candidate> {
    candidates: CandidateType[],
    // nVotes = nOutOfBoundsVotes + nAbstentions + nTallyVotes
    nOutOfBoundsVotes: number,
    nAbstentions: number,
    nTallyVotes: number,
}

export type starSummaryData = genericSummaryData<starCandidate>

export type approvalSummaryData = genericSummaryData<approvalCandidate>

export interface allocatedScoreSummaryData extends genericSummaryData<candidate> {
    splitPoints: number[],
    spentAboves: number[],
    weight_on_splits: number[],
    weightedScoresByRound: number[][]
}
export interface pluralitySummaryData extends genericSummaryData<candidate> {
    nOvervotes: number
}

export interface rankedRobinSummaryData extends genericSummaryData<candidate> {
    rankHist: rankHist,
}

export interface irvSummaryData extends rankedRobinSummaryData {}

export type tabulatorLog = string | tabulatorLogObject;

interface tabulatorLogObject {
    key: string,
    [key: string]: string | number | string[]
}

type tieBreakType = 'none' | 'score' | 'five_star' | 'random';
export interface roundResults<CandidateType extends candidate> {
    winners: CandidateType[],
    runner_up: CandidateType[],
    tied: CandidateType[],
    tieBreakType: tieBreakType,
    logs: tabulatorLog[],
}

export interface genericResults<CandidateType extends candidate, SummaryType extends genericSummaryData<CandidateType>> {
    votingMethod: votingMethod,
    elected: CandidateType[],
    tied: candidate[],
    other: candidate[],
    roundResults: roundResults<CandidateType>[],
    summaryData: SummaryType,
    tieBreakType: tieBreakType,
}

export interface starResults extends genericResults<starCandidate, starSummaryData> {
    votingMethod: 'STAR',
}

export interface allocatedScoreResults extends genericResults<candidate, allocatedScoreSummaryData>{
    votingMethod: 'STAR_PR',
    tieRounds: candidate[][],
    logs: tabulatorLog[]
}

export interface approvalResults extends genericResults<approvalCandidate, approvalSummaryData> {
    votingMethod: 'Approval',
}

export interface pluralityResults extends genericResults<candidate, pluralitySummaryData> {
    votingMethod: 'Plurality',
}

export interface rankedRobinResults extends genericResults<candidate, rankedRobinSummaryData> {
    votingMethod: 'RankedRobin',
}

export interface irvElimationRoundResults{
    winners: candidate[],
    eliminated: candidate[],
    logs: string[], /* envisioned for possible debugging? */
    standings: {candidateIndex: number, hareScore: number}[],
      /* Sorted by decreasing Hare score */
    /* Next two are maybe filled in only in front end: */
    exhaustedVoteCount?: number | undefined,
    isStartOfSearch?: boolean | undefined,
}

export interface irvResults extends genericResults<candidate, irvSummaryData> {
    votingMethod: 'IRV' | 'STV',
    summaryData: rankedRobinSummaryData,
    elimationRoundResults: irvElimationRoundResults[],
    logs: string[],
    voteCounts: number[][],
      /* Outer index is round; inner index is candidate. */
    exhaustedVoteCounts: number[],  /* by round */
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
