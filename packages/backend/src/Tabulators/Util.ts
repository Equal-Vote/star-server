import { genericSummaryData, totalScore, totalScoreKey  } from "@equal-vote/star-vote-shared/domain_model/ITabulators";
import { IparsedData } from "./ParseData";

export const totalScoreComparator = (criteria: totalScoreKey, a: totalScore, b: totalScore): number | undefined => {
  if(a[criteria] === undefined) return undefined;
  if(b[criteria] === undefined) return undefined;
  // Note: I can remove the 'as number' once I make the totalScore fields non-optional
  if((a[criteria] as number) > (b[criteria] as number)) return -1;
  if((a[criteria] as number) < (b[criteria] as number)) return 1;
  return undefined;
}

export const getSummaryData = (
  candidates: string[],
  parsedData: IparsedData,
  randomTiebreakOrder: number[],
  methodType: 'cardinal' | 'orindal',
  sortFunc: (a: totalScore, b:totalScore) => number | undefined,
  maxSupport=1,
): genericSummaryData => {
  // Initialize randomTiebreakOrder structure
  if (randomTiebreakOrder.length < candidates.length) {
    randomTiebreakOrder = candidates.map((c,index) => index)
  }

  // Count bullet votes
  let nBulletVotes = parsedData.scores.reduce((nBulletVotes, vote) => {
      let nSupported = vote.reduce((n, candidateScore) => n + (candidateScore > 0 ? 1 : 0), 0);
      return nBulletVotes + ((nSupported === 1)? 1 : 0);
    },
    0
  );

  // Matrix for voter preferences
  const preferenceMatrix: number[][] = candidates.map((_,i) => 
    candidates.map((_,j) =>
      // count the number of votes with i > j
      parsedData.scores.reduce((n, vote) => n + (methodType == 'cardinal'?
        // Cardinal systems: vote goes to the candinate with the higher number
        (vote[i] > vote[j])? 1 : 0
      :
        // Orindal systems: vote goes to the candinate with the smaller rank
        (vote[i] < vote[j])? 1 : 0
      ), 0)
    )
  )

  // Matrix for voter preferences
  const pairwiseMatrix: number[][] = candidates.map((_,i) => 
    // count if more voters prefer i to j
    candidates.map((_,j) => (preferenceMatrix[i][j] > preferenceMatrix[j][i])? 1 : 0)
  )

  // Totaled score measures for each candidate
  const totalScores: totalScore[] = candidates.map((_,candidateIndex) => ({
    index: candidateIndex,
    score: parsedData.scores.reduce(
      (score, vote) => score + vote[candidateIndex],
      0
    ),
    pairwiseWins: candidates.reduce((n,_,otherCandidateIndex) =>
      n + ((pairwiseMatrix[candidateIndex][otherCandidateIndex] == 1) ? 1 : 0),
      0
    ),
    maxSupportCount: parsedData.scores.reduce(
      (score, vote) => (score + ((vote[candidateIndex] == maxSupport) ? 1 : 0)),
      0
    ),
  }));

  // Pairwise loses with tied score
  // NOTE: we can't include this in the above loop since we rely on score
  candidates.forEach((_, candidateIndex) => {
    totalScores[candidateIndex].pairwiseLosesWithTiedScore = candidates.reduce((n,_,otherCandidateIndex) => {
        if(candidateIndex == otherCandidateIndex) return n;
        if(totalScores[candidateIndex].score != totalScores[otherCandidateIndex].score) return n;
        return (pairwiseMatrix[candidateIndex][otherCandidateIndex] == 1) ? 0 : 1
    }, 0);
  })

  // Sort totalScores
  totalScores.sort((a, b) =>
      sortFunc(a, b) ?? 
      (randomTiebreakOrder[a.index] - randomTiebreakOrder[b.index])
  );

  return {
    candidates: candidates.map((candidate, index) => 
      ({ index: index, name: candidate, tieBreakOrder: randomTiebreakOrder[index] })
    ),
    totalScores,
    preferenceMatrix,
    pairwiseMatrix,
    nValidVotes: parsedData.validVotes.length,
    nInvalidVotes: parsedData.invalidVotes.length,
    nUnderVotes: parsedData.underVotes,
    nBulletVotes: nBulletVotes,
  }
}

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