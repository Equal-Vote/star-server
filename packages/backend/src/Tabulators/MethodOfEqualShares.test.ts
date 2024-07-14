import { MethodOfEqualShares } from "./MethodOfEqualShares";
const Fraction = require("fraction.js");

describe("Method of Equal Shares Tests", () => {
  test("Basic Example", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 4, 4, 0],
      [0, 0, 0, 3],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
    ];
    const results = MethodOfEqualShares(candidates, votes, 2, [], false, false);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Allison");
    expect(results.elected[1].name).toBe("Doug");
    const weightedScoresRound0 =
      results.summaryData.weightedScoresByRound[0].map((score) =>
        parseFloat(score.toString()),
      );
    expect(weightedScoresRound0).toStrictEqual([25, 24, 24, 23]);
    const weightedScoresRound1 =
      results.summaryData.weightedScoresByRound[1].map((score) =>
        parseFloat(score.toString()),
      );
    expect(weightedScoresRound1).toStrictEqual([0, 0, 16, 23]);
  });

  test("Influence Budget Redistribution", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 4, 4, 0],
      [0, 0, 0, 3],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
    ];
    const results = MethodOfEqualShares(candidates, votes, 2, [], false, false);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Allison");
    expect(results.elected[1].name).toBe("Doug");
    const weightedScoresRound0 =
      results.summaryData.weightedScoresByRound[0].map((score) =>
        parseFloat(score.toString()),
      );
    expect(weightedScoresRound0).toStrictEqual([40, 39, 23, 18]);
    const weightedScoresRound1 =
      results.summaryData.weightedScoresByRound[1].map((score) =>
        parseFloat(score.toString()),
      );
    expect(weightedScoresRound1).toStrictEqual([0, 9.75, 14.75, 18]);
  });

  test("Random Tiebreaker", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 4, 0],
      [0, 0, 0, 3],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
    ];
    const results = MethodOfEqualShares(candidates, votes, 2, [], true, false);
    expect(results.elected.length).toBe(2);
    expect(results.tied[0].length).toBe(2); // two candidates tied in the first round
    expect(results.elected[0].name).toBe("Allison"); // random tiebreaker, second place lower index 1
    expect(results.elected[1].name).toBe("Doug");
  });

  test("Random Tiebreaker with Defined Order", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 4, 0],
      [0, 0, 0, 3],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
    ];
    const results = MethodOfEqualShares(
      candidates,
      votes,
      2,
      [4, 3, 2, 1],
      true,
      false,
    );
    expect(results.elected.length).toBe(2);
    expect(results.tied[0].length).toBe(2); // two candidates tied in the first round
    expect(results.elected[0].name).toBe("Bill"); // random tiebreaker, second place lower index 1
    expect(results.elected[1].name).toBe("Doug");
  });

  test("Valid/Invalid/Under/Bullet Vote Counts", () => {
    const candidates = ["Allison", "Bill", "Carmen"];
    const votes = [
      [1, 3, 5],
      [1, 3, 5],
      [1, 3, 5],
      [0, 0, 0],
      [0, 0, 0],
      [-1, 3, 5],
      [0, 3, 6],
      [5, 0, 0],
      [0, 5, 0],
      [0, 0, 5],
    ];
    const results = MethodOfEqualShares(candidates, votes, 1, [], false, false);
    expect(results.summaryData.nValidVotes).toBe(8);
    expect(results.summaryData.nInvalidVotes).toBe(2);
    expect(results.summaryData.nUnderVotes).toBe(2);
    expect(results.summaryData.nBulletVotes).toBe(3);
  });
});
