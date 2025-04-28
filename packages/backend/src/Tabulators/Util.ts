import { candidate, genericResults, genericSummaryData, rawVote, roundResults, vote } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

declare namespace Intl {
  class ListFormat {
    constructor(locales?: string | string[], options?: {});
    public format: (items: string[]) => string;
  }
}
// converts list of strings to string with correct grammar ([a,b,c] => 'a, b, and c')
export const commaListFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

// Format a Timestamp value into a compact string for display;
function formatTimestamp(value : string) {
  const d = new Date(Date.parse(value));
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();
  const hour = d.getHours();
  const minute = d.getMinutes();

  const fullDate =
    year === currentYear
      ? `${month}/${date}`
      : year >= 2000 && year < 2100
        ? `${month}/${date}/${year - 2000}`
        : `${month}/${date}/${year}`;

  const timeStamp = `${fullDate} ${hour}:${minute}`;
  return timeStamp;
}



const isScore = (value : any) =>
  !isNaN(value) && (value === null || (value > -10 && value < 10));

const transformScore = (value : number) => {
  // minScore and maxScore were undefined when moving the file to typescript, so I'm hard coding them for now
  const minScore = 0;
  const maxScore = 5;
  value ? Math.min(maxScore, Math.max(minScore, value)) : 0;
}

// Functions to parse Timestamps
const isTimestamp = (value : any) => !isNaN(Date.parse(value));
const transformTimestamp = (value : any) => formatTimestamp(value);

// Functions to parse everything else
const isAny = (value : any) => true;
const transformAny = (value : any) => (value ? value.toString().trim() : "");

// Column types to recognize in Cast Vote Records passed as CSV data
const columnTypes = [
  { test: isScore, transform: transformScore },
  { test: isTimestamp, transform: transformTimestamp },
  // Last row MUST accept anything!
  { test: isAny, transform: transformAny }
];

function getTransforms(header : any, data : string[][]) {
  const transforms : any[] = [];
  const rowCount = Math.min(data.length, 3);
  header.forEach((title : string, n : number) => {
    var transformIndex = 0;
    if (title === "Timestamp") {
      transformIndex = 1;
    } else {
      for (let i = 0; i < rowCount; i++) {
        const value = data[i][n];
        const index = columnTypes.findIndex((element) => element.test(value));
        if (index > transformIndex) {
          transformIndex = index;
        }
        if (transformIndex >= columnTypes.length) {
          break;
        }
      }
    }
    // We don't have to check for out-of-bound index because
    // the last row in columnTypes accepts anything
    transforms.push(columnTypes[transformIndex].transform);
  });
  return transforms;
}

export const makeBoundsTest = (minValue:number, maxValue:number) => {
	return [
		'nOutOfBoundsVotes',
		(ballot: number[]) => ballot.filter(b => b < minValue || maxValue < b).length > 0
	] as const;
}

export const makeAbstentionTest = (underVoteValue:number|null = 0) => {
	return [
		'nAbstentions',
		(ballot: number[]) => ballot.filter(b => (underVoteValue === null ? b : (b??0)) === underVoteValue).length == ballot.length
	] as const;
}

type StatTestPair = Readonly<[string, Function]>;

const filterInitialVotes = (rawVotes: rawVote[], tests: StatTestPair[]): [vote[], {[key: string]: number}] => {
	let tallyVotes: vote[] = [];
	let summaryStats: {[key: string]: number} = {};

  tests.forEach(([statName, statTest]) => {
    summaryStats[statName] = 0;
  })
  summaryStats['nTallyVotes'] = 0;

  rawVotes.forEach(rawVote => {
    // using a classic loop so that I can return out of it
    for(let i = 0; i < tests.length; i++){
      let [statName, statTest] = tests[i]; 
      if(statTest(rawVote)){
        summaryStats[statName] = (summaryStats[statName] ?? 0)+1;
        return;
      }
    }
    summaryStats.nTallyVotes++;
    tallyVotes.push({
      ...rawVote,
      marks: Object.fromEntries(Object.entries(rawVote.marks).map(([c, v]) => [c, v ?? 0]))
    })
  })

  return [tallyVotes, summaryStats];
}

export const getInitialData = <CandidateType extends candidate, SummaryType extends genericSummaryData<CandidateType>,>(
  candidates: CandidateType[],
	allVotes: vote[],
  methodType: 'cardinal' | 'ordinal',
  statTests: StatTestPair[],
  sortField: keyof CandidateType,
): [vote[], SummaryType] => {
	// Filter Ballots
	const [tallyVotes, summaryStats] = filterInitialVotes(allVotes, statTests);

  // Matrix for voter preferences
  const remapZero = (n:number) => n == 0 ? Infinity : n;
  candidates.forEach(a => {
    candidates.forEach(b => {
      a.votesPreferredOver[b.id] = tallyVotes.reduce((n, vote) => n + (methodType == 'cardinal'?
        // Cardinal systems: vote goes to the candinate with the higher number and 0 is infinity
        (vote.marks[a.id] > vote.marks[b.id])? 1 : 0
      :
        // Orindal systems: vote goes to the candinate with the smaller rank
        (remapZero(vote.marks[a.id]) < remapZero(vote.marks[b.id]))? 1 : 0
      ), 0)
    })
  })

  // Matrix for voter preferences
  candidates.forEach(a => {
    candidates.forEach(b => {
      a.winsAgainst[b.id] = a.votesPreferredOver[b.id] > b.votesPreferredOver[a.id];
    })
  })

  // Totaled score measures for each candidate
  if(candidates.every(c => 'score' in c)){ // using every to make typescript happy
    candidates.forEach(c => {
      c.score = tallyVotes.reduce((score, vote) => score + vote.marks[c.id], 0)
    })   
  }

  // Compute copeland score based on matrix
  if(candidates.every(c => 'copelandScore' in c)){ // using every to make typescript happy
    candidates.forEach(c => {
      c.copelandScore = candidates.reduce(
        (prev, other) => {
          if(c.winsAgainst[other.id]) return prev+1;
          if(c.winsAgainst[other.id] === other.winsAgainst[c.id]) return prev+0.5;
          return prev;
        }, 0
      )
    })   
  }

  // Pre-Sort by the sort field
  candidates = candidates.sort((a, b) => -((a[sortField] as number) - (b[sortField] as number)))

  return [
		tallyVotes, 
		{
      candidates,
			...summaryStats,
		} as SummaryType 
	];
}

export const runBlocTabulator = <CandidateType extends candidate, SummaryType extends genericSummaryData<CandidateType>, ResultsType extends genericResults<CandidateType, SummaryType>,>(
	results: ResultsType,
	nWinners: number,
	singleWinnerCallback: (remainingCandidates: CandidateType[], summaryData: SummaryType) => roundResults<CandidateType>,
  evaluate?: (candidate: CandidateType, roundResults: roundResults<CandidateType>[], summaryData: SummaryType) => number[]
): ResultsType => {
  let remainingCandidates: CandidateType[] = [...results.summaryData.candidates];

  for(let w = 0; w < nWinners; w++){
    let roundResults = singleWinnerCallback(remainingCandidates, results.summaryData);

    results.elected.push(...roundResults.winners);
    results.roundResults.push(roundResults);

    // remove winner for next round
    remainingCandidates = remainingCandidates.filter(candidate => candidate.id != roundResults.winners[0].id)

    // only save the tie breaker info if we're in the final round
    if(w == nWinners-1){
      results.tied = roundResults.tied; 
      results.tieBreakType = roundResults.tieBreakType; // only save the tie breaker info if we're in the final round
    }
  }

  results.other = remainingCandidates; // remaining candidates in sortedScores

  if(evaluate){
    // evaulate() converts candidates into an number[] of evaluation scores
    // candidates with higher evaluation scores will be sorted higher
    // index 0 is checked first, then further indexes are checked to break ties

    results.summaryData.candidates = 
      results.summaryData.candidates
        .map((c: CandidateType) => ([c, evaluate(c, results.roundResults, results.summaryData as SummaryType)] as [CandidateType, number[]]))
        .sort(([_, a]: [candidate, number[]], [__, b] : [candidate, number[]]) => {
          const compare = (a: number[], b: number[], i: number): number => {
            if(i > a.length || i > b.length) return 0;
            let diff = -(a[i] - b[i]);
            return diff == 0 ? compare(a, b, i+1) : diff;
          };
          return compare(a, b, 0)
        }) 
        .map(([c, _]: [CandidateType, number[]]) => c)
  }

  return results
}