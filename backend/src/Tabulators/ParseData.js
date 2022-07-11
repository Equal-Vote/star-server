var minScore = 0;
var maxScore = 5;

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

function ParseData(header, data, minValue = 0, maxValue = 5, nAllowedSupport = Infinity, ranked = false) {
    minScore = minValue;
    maxScore = maxValue;
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
    const invalidvotes = []
    // Parse each row of data into voter, undervote, and score arrays
    data.forEach((row, n) => {
        const voter = { csvRow: n + 1 };
        const score = [];
        let total = 0;
        let hasData = false;
        let candidatesSupported = 0;
        let scoresUsed = Array(maxValue - minValue + 1).fill(0);
        let voteValid = true;
        header.forEach((col, i) => {
            const value = transforms[i](row[i]);
            if (row[i] !== null && row[i] !== "") {
                hasData = true;
            }
            if (transforms[i] === transformScore) {
                scoresUsed[value - minValue]++
                if (ranked && value>0 && scoresUsed[value - minValue]>1){
                    voteValid = false;
                }

                score.push(value);
                total += value;
                if (value > 0) {
                    candidatesSupported++;
                    if (candidatesSupported>nAllowedSupport){
                        voteValid=false;
                    }
                }
            } else {
                voter[col] = value;
            }
        });
        console.log(scoresUsed)

        // Check for blank lines and undervote
        if (hasData) {
            if (!voteValid){
                invalidvotes.push(voter)
            } else if (total > 0) {
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



    return {
        header,
        data,
        candidates,
        scores,
        undervotes,
        bulletvotes,
        voters
    };
}

module.exports = ParseData