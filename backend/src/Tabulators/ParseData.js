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

function getStarBallotValidity(ballot) {
    const minScore = 0
    const maxScore = 5
    let isUnderVote = true
    for (let i = 0; i < ballot.length; i++) {
        if (ballot[i] < minScore || ballot[i] > maxScore) {
            return { isValid: false, isUnderVote: false }
        }
        if (ballot[i] > minScore) {
            isUnderVote = false
        }
    }
    return { isValid: true, isUnderVote: isUnderVote }
}

function ParseData(data, validityCheck = getStarBallotValidity) {
    // Initialize arrays
    const scores = [];
    const validVotes = [];
    const underVotes = [];
    const invalidVotes = [];
    // Parse each row of data into voter, undervote, and score arrays
    data.forEach((row, n) => {
        const voter = { csvRow: n + 1 };
        const ballotValidity = validityCheck(row)
        if (!ballotValidity.isValid) {
            invalidVotes.push(voter)
        }
        else if (ballotValidity.isUnderVote) {
            underVotes.push(voter)
        }
        else {
            scores.push(row)
            validVotes.push(voter);
        }
    });
    return {
        scores,
        invalidVotes,
        underVotes,
        validVotes
    };
}

module.exports = ParseData