import { candidate, totalScore } from "shared/domain_model/ITabulators";

declare namespace Intl {
  class ListFormat {
    constructor(locales?: string | string[], options?: {});
    public format: (items: string[]) => string;
  }
}
// converts list of strings to string with correct grammar ([a,b,c] => 'a, b, and c')
export const commaListFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

export function sortTotalScores(totalScores : totalScore[], candidates : candidate[]){
  return totalScores.sort((a: totalScore, b: totalScore) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    if (candidates[a.index].tieBreakOrder < candidates[b.index].tieBreakOrder) return -1
    return 1
  });
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