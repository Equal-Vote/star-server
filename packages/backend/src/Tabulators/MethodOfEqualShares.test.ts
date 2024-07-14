import { methodOfEqualShares } from "./MethodOfEqualShares";

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
    const results = methodOfEqualShares(candidates, votes, 2, []);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Allison");
    expect(results.elected[1].name).toBe("Carmen");
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
    const results = methodOfEqualShares(candidates, votes, 2, []);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Allison");
    expect(results.elected[1].name).toBe("Bill");
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
    const results = methodOfEqualShares(candidates, votes, 2, []);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Allison"); // random tiebreaker, second place lower index 1
    expect(results.elected[1].name).toBe("Bill");
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
    const results = methodOfEqualShares(candidates, votes, 2, [4, 3, 2, 1]);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Allison"); // random tiebreaker, second place lower index 1
    expect(results.elected[1].name).toBe("Bill");
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
    const results = methodOfEqualShares(candidates, votes, 1, []);
    expect(results.summaryData.nValidVotes).toBe(8);
    expect(results.summaryData.nInvalidVotes).toBe(2);
    expect(results.summaryData.nUnderVotes).toBe(2);
    expect(results.summaryData.nBulletVotes).toBe(3);
  });
});
