const minScore = 0;
const maxScore = 5;

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
        voters.push(voter);
        if (candidatesSupported === 1) {
          bulletvotes.push(voters.length - 1);
        }
      } else {
        undervotes.push(voter);
      }
    }
  });


  const prResults = splitPR([...candidates], scores, nWinners);

  return {
    header,
    data,
    candidates,
    scores,
    voters,
    undervotes,
    bulletvotes,
    matrix,
    candidateOrder,
    singleResults,
    multiResults,
    prResults
  };
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

function splitPR(candidates, scores, nWinners) {
  // Handle degenerate edge cases
  if (!candidates || candidates.length === 0) {
    return { winners: [], losers: [], others: [] };
  }
  var num_candidates = candidates.length
  if (num_candidates === 1) {
    return { winners: candidates, losers: [], others: [] };
  }

  // Normalize scores array
  var scoresNorm = normalizeArray(scores, maxScore);

  // Find number of voters and quota size
  const V = scoresNorm[0].length;
  const quota = V / nWinners;

  var ballot_weights = Array(V).fill(1);
  // Initialize output arrays
  var winners = [];
  var losers = [];
  var others = [];
  var debuginfo = { splitPoints: [], spentAboves: [], weight_on_splits: [] };
  var ties = [];
  var weightedSumsByRound = []
  var candidatesByRound = []
  // run loop until specified number of winners are found
  while (winners.length < nWinners) {
    // weight the scores
    var weighted_scores = Array(scoresNorm.length);
    var weighted_sums = Array(scoresNorm.length);
    scoresNorm.forEach((row, r) => {
      weighted_scores[r] = [];
      row.forEach((score, s) => {
        weighted_scores[r][s] = score * ballot_weights[s];
      });
      // sum scores for each candidate
      weighted_sums[r] = sumArray(weighted_scores[r]);
    });
    weightedSumsByRound.push(weighted_sums)
    candidatesByRound.push([...candidates])
    // get index of winner
    var maxAndTies = indexOfMax(weighted_sums);
    var w = maxAndTies.maxIndex;
    var roundTies = [];
    maxAndTies.ties.forEach((index, i) => {
      roundTies.push(candidates[index]);
    });
    ties.push(roundTies);
    // add winner to winner list, remove from ballots
    winners.push(candidates[w]);
    scoresNorm.splice(w, 1);
    candidates.splice(w, 1);

    // create arrays for sorting ballots
    var cand_df = [];
    var cand_df_sorted = [];

    weighted_scores[w].forEach((weighted_score, i) => {
      cand_df.push({
        index: i,
        ballot_weight: ballot_weights[i],
        weighted_score: weighted_score
      });
      cand_df_sorted.push({
        index: i,
        ballot_weight: ballot_weights[i],
        weighted_score: weighted_score
      });
    });
    cand_df_sorted.sort((a, b) =>
      a.weighted_score < b.weighted_score ? 1 : -1
    );

    var split_point = findSplitPoint(cand_df_sorted, quota);

    debuginfo.splitPoints.push(split_point);

    var spent_above = 0;
    cand_df.forEach((c, i) => {
      if (c.weighted_score > split_point) {
        spent_above += c.ballot_weight;
      }
    });
    debuginfo.spentAboves.push(spent_above);

    if (spent_above > 0) {
      cand_df.forEach((c, i) => {
        if (c.weighted_score > split_point) {
          cand_df[i].ballot_weight = 0;
        }
      });
    }

    var weight_on_split = findWeightOnSplit(cand_df, split_point);

    debuginfo.weight_on_splits.push(weight_on_split);
    ballot_weights = updateBallotWeights(
      cand_df,
      ballot_weights,
      weight_on_split,
      quota,
      spent_above,
      split_point
    );
  }
  //Moving weighted sum totals to matrix for easier plotting
  var weightedSumsData = []
  for (let c = 0; c < num_candidates; c++) {
    weightedSumsData.push(Array(weightedSumsByRound.length).fill(0))
  }
  weightedSumsByRound.map((weightedSums,i) => {
    weightedSums.map((weightedSum,j) => {
      let candidate = candidatesByRound[i][j]
      weightedSumsData[candidate.index][i] = weightedSum*5
    })
  })
  losers = candidates;
  return { winners, losers, others, ties, debuginfo,weightedSumsData };
}

function updateBallotWeights(
  cand_df,
  ballot_weights,
  weight_on_split,
  quota,
  spent_above,
  split_point
) {
  if (weight_on_split > 0) {
    var spent_value = (quota - spent_above) / weight_on_split;
    cand_df.forEach((c, i) => {
      if (c.weighted_score === split_point) {
        cand_df[i].ballot_weight = cand_df[i].ballot_weight * (1 - spent_value);
      }
    });
  }
  cand_df.forEach((c, i) => {
    if (c.ballot_weight > 1) {
      ballot_weights[i] = 1;
    } else if (c.ballot_weight < 0) {
      ballot_weights[i] = 0;
    } else {
      ballot_weights[i] = c.ballot_weight;
    }
  });

  return ballot_weights;
}

function findWeightOnSplit(cand_df, split_point) {
  var weight_on_split = 0;
  cand_df.forEach((c, i) => {
    if (c.weighted_score === split_point) {
      weight_on_split += c.ballot_weight;
    }
  });
  return weight_on_split;
}

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;
  var ties = [];
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
      ties = [];
    } else if (arr[i] === max) {
      ties.push(i);
    }
  }

  return { maxIndex, ties };
}

function sumArray(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function normalizeArray(scores, maxScore) {
  // Normalize scores array
  var scoresNorm = Array(scores.length);
  scores.forEach((row, r) => {
    scoresNorm[r] = [];
    row.forEach((score, s) => {
      scoresNorm[r][s] = score / maxScore;
    });
  });
  return scoresNorm;
}

function findSplitPoint(cand_df_sorted, quota) {
  var under_quota = [];
  var under_quota_scores = [];
  var cumsum = 0;
  cand_df_sorted.forEach((c, i) => {
    cumsum += c.ballot_weight;
    if (cumsum < quota) {
      under_quota.push(c);
      under_quota_scores.push(c.weighted_score);
    }
  });
  return Math.min(...under_quota_scores);
}

/***************************** Public API *****************************/

module.exports = function StarResults(candidates, votes, nWinners = 1) {
  const cvr = parseData(candidates, votes, nWinners);
  return {pr: cvr.prResults };
}
