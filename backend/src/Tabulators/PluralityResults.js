const minScore = 0;
const maxScore = 1;

function parseData(header, data, nWinners) {
  // Inspect the data to determine the type of data in each column
  const transforms = getTransforms(header, data);

  // The list of candidates is based on the columns containing STAR scores
  const candidates = [];
  for (let i = 0; i < transforms.length; i++) {
    if (transforms[i] === transformScore) {
      const candidate = {
        name: transformAny(header[i]),
        index: candidates.length,
        csvColumn: i,
        totalScore: 0,
        support: new Array(6).fill(0)
      };
      candidates.push(candidate);
    }
  }

  // Initialize arrays
  const scores = Array(candidates.length);
  for (let i = 0; i < candidates.length; i++) {
    scores[i] = [];
  }
  const voters = [];
  const undervotes = [];
  const bulletvotes = [];

  // Parse each row of data into voter, undervote, and score arrays
  data.forEach((row, n) => {
    const voter = { csvRow: n + 1 };
    const score = [];
    let total = 0;
    let hasData = false;
    let candidatesSupported = 0;
    header.forEach((col, i) => {
      const value = transforms[i](row[i]);
      if (row[i] !== null && row[i] !== "") {
        hasData = true;
      }
      if (transforms[i] === transformScore) {
        score.push(value);
        total += value;
        if (value > 0) {
          candidatesSupported++;
        }
      } else {
        voter[col] = value;
      }
    });

    // Check for blank lines and undervote
    if (hasData) {
      if (total > 0) {
        for (let i = 0; i < score.length; i++) {
          scores[i].push(score[i]);
        }
        if (candidatesSupported === 1) {
          bulletvotes.push(voters.length - 1);
          voters.push(voter);
        }
      } else {
        undervotes.push(voter);
      }
    }
  });

  // Calculate totalScore and averageScore for each candidate
  voters.forEach((voter, v) => {
    candidates.forEach((candidate, c) => {
      candidate.totalScore += scores[c][v];
      candidate.support[scores[c][v]]++;
    });
  });
  if (voters.length > 0) {
    candidates.forEach(
      (candidate) =>
        (candidate.averageScore = (
          candidate.totalScore / voters.length
        ).toFixed(2))
    );
  }

  const candidateOrder = sortCandidates(candidates);
  const singleResults = splitCandidates(candidateOrder, candidates);
  return {
    header,
    data,
    candidates,
    scores,
    voters,
    undervotes,
    bulletvotes,
    candidateOrder,
    singleResults
  };
}

function splitCandidates(candidateOrder, candidates) {
  // Handle degenerate edge cases
  if (!candidateOrder || candidateOrder.length === 0) {
    return { winners: [], losers: [], others: [] };
  }

  if (candidateOrder.length === 1) {
    return { winners: candidateOrder, losers: [], others: [] };
  }

  // Helper function to retrive total score for a candidate
  const getScore = (index) => candidates[candidateOrder[index]].totalScore;

  // We know the first and second candidates in the sorted order are finalists
  // But second may be tied with third, fourth, etc
  const targetScore = getScore(1);
  var count = 2;

  for (let i = 2; i < candidateOrder.length; i++) {
    if (getScore(i) >= targetScore) {
      count++;
    } else {
      break;
    }
  }
  var winners = [candidateOrder[0]]
  var losers = [...candidateOrder]
  losers.splice(0,1)

  return { winners, losers};
}

function sortCandidates(candidates) {
  // Start by creating an array corresponding to the index values
  // of the candidates array
  const order = [];
  for (let i = 0; i < candidates.length; i++) order.push(i);

  const sorted = order.sort((a, b) => {
    // Sort first by totalScore
    const aScore = candidates[a].totalScore;
    const bScore = candidates[b].totalScore;
    if (aScore > bScore) return -1;
    if (aScore < bScore) return 1;
    return a - b;
  });

  return sorted;
}

// Format a Timestamp value into a compact string for display;
function formatTimestamp(value) {
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

// Functions to parse STAR scores
const isScore = (value) =>
  !isNaN(value) && (value === null || (value > -10 && value < 10));
const transformScore = (value) =>
  value ? Math.min(maxScore, Math.max(minScore, value)) : 0;

// Functions to parse Timestamps
const isTimestamp = (value) => !isNaN(Date.parse(value));
const transformTimestamp = (value) => formatTimestamp(value);

// Functions to parse everything else
const isAny = (value) => true;
const transformAny = (value) => (value ? value.toString().trim() : "");

// Column types to recognize in Cast Vote Records passed as CSV data
const columnTypes = [
  { test: isScore, transform: transformScore },
  { test: isTimestamp, transform: transformTimestamp },
  // Last row MUST accept anything!
  { test: isAny, transform: transformAny }
];

function getTransforms(header, data) {
  const transforms = [];
  const rowCount = Math.min(data.length, 3);
  header.forEach((title, n) => {
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



/******************************** Flatten Methods ******************************/

function flatten(cvr, sections) {
  // First, create an array containing array indexes for each candidate
  var order = [];
  sections.forEach((section) => {
    section.candidates.forEach((candidate) => order.push(candidate));
  });
  var newCandidates = order.map((index) => cvr.candidates[index]);
  
  var newSections = [];
  sections.forEach((section) => {
    var candidates = [];
    section.candidates.forEach((candidate) =>
      candidates.push(
        newCandidates.findIndex(
          (newCandidate) => candidate === newCandidate.index
        )
      )
    );
    newSections.push({ title: section.title, candidates: candidates });
  });

  return {
    candidates: newCandidates,
    sections: newSections
  };
}

function flattenSingle(cvr) {
  
  const data = cvr.singleResults;
  const sections = [
    {
      title: data.winners.length > 1 ? "Winner (TIE)" : "Winner",
      candidates: data.winners
    },
    {
      title: "Losers",
      candidates: data.losers
    }
  ];
  return flatten(cvr, sections);
}

/***************************** Public API *****************************/

module.exports = function PluralityResults(candidates, votes, nWinners = 3) {
  const cvr = parseData(candidates, votes, nWinners);
  const single = flattenSingle(cvr);
  return { cvr: cvr, single };
}
