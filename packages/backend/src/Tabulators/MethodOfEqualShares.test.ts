import { methodOfEqualShares } from "./MethodOfEqualShares";

describe("Method of Equal Shares Tests", () => {
  test("Basic Example", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [0, 5, 0, 0],
      [5, 5, 0, 0],
      [5, 5, 0, 0],
      [5, 5, 0, 0],
      [5, 5, 5, 5],
      [0, 0, 0, 5],
      [0, 0, 5, 5],
      [0, 0, 5, 5],
      [0, 0, 5, 5],
      [0, 0, 5, 5],
    ];
    const results = methodOfEqualShares(candidates, votes, 2, []);
    expect(results.elected.length).toBe(2);
    expect(["Carmen", "Bill", "Doug"]).toEqual(expect.arrayContaining([results.elected[1].name]));
    expect(["Doug", "Allison"]).toEqual(expect.arrayContaining([results.elected[1].name]));
    });

  test("Basic Example 2", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [0,1,1,1],
      [1,1,1,1],
      [1,0,1,1],
      [1,1,0,0],
      [1,1,1,1],
      [0,1,1,0],
      [0,1,1,0],
      [0,0,0,0],
      [1,1,1,0],
      [0,1,0,0],
      [0,1,1,0],
      [0,1,1,0],
      [0,1,0,1],
      [0,0,1,0],
      [1,1,1,0],
      [1,1,0,1],
      [0,1,0,1],
      [0,1,1,1],
    ];
    const results = methodOfEqualShares(candidates, votes, 2, []);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Bill");
    expect(results.elected[1].name).toBe("Carmen");
  });

  test("Basic Example 3", () => {
    const candidates = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
    ];

    // 1000111100000010
    // 0100000011000111
    // 1000111101011010
    // 1111011000000000
    // 0001001001111100
    // 1101100111011001
    // 1111111000011110
    // 0110100010001011
    // 0110011111001100
    // 1001011111110010

    const votes = [
      [1,0,0,0,0,1,0,1,0,1,1],
      [1,1,0,1,0,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,1,0,1,0],
      [0,0,1,0,0,1,1,0,0,1,0],
      [1,1,1,1,1,1,0,1,0,1,1],
      [1,1,0,0,0,1,0,0,1,1,1],
      [1,0,0,1,0,0,1,0,1,0,0],
      [0,1,1,0,0,1,0,0,1,0,1],
      [1,1,1,0,1,0,1,0,1,1,0],
      [1,1,1,0,1,1,1,1,0,1,0],
      [0,0,1,0,0,1,1,0,0,0,0],
      [1,1,0,0,1,0,0,1,1,1,0],
      [1,0,0,0,1,0,1,1,1,1,1],
      [0,1,0,1,1,1,0,1,0,0,1],
      [0,0,1,0,0,1,1,1,0,0,0],
      [0,0,1,0,1,0,1,1,1,1,1],
      [1,0,1,0,1,1,1,0,0,1,1],
      [1,0,0,1,1,0,0,0,1,1,0],
      [1,1,1,1,1,1,0,0,0,1,1],
      [1,0,0,1,0,0,0,0,0,1,1],
      [0,0,1,1,0,1,1,0,0,0,1],
      [1,1,0,0,0,1,0,0,0,0,1],
      [1,1,0,1,0,1,1,0,0,1,1],
      [1,0,0,1,0,1,0,1,0,0,1],
      [0,1,0,0,1,1,1,1,0,1,0],
      [1,1,1,0,1,0,0,1,1,0,1],
      [0,1,0,0,0,0,0,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0],
      [1,0,1,0,0,0,1,0,0,1,1],
      [1,0,1,1,1,1,1,0,0,0,0],
      [1,0,0,1,1,0,1,1,1,1,1],
      [1,1,0,1,1,1,0,1,0,0,0],
      [0,0,1,0,1,0,0,1,1,0,1],
      [1,0,1,0,1,0,0,0,0,0,0],
      [0,1,0,1,0,0,1,0,0,0,0],

    ];
    const results = methodOfEqualShares(candidates, votes, 4, []);
    console.log(results.summaryData)
    console.log(results.elected)
    console.log(...results.roundResults)
    expect(results.elected.length).toBe(4);
    expect(results.elected[0].name).toBe("0");
    expect(["6", "10", "5",]).toEqual(expect.arrayContaining([results.elected[1].name]));
    expect(results.elected[2].name).toBe("9");
    expect(["6", "10", "5","9"]).toEqual(expect.arrayContaining([results.elected[3].name]));
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
    const results = methodOfEqualShares(candidates, votes, 2, ["Doug", "Carmen", "Bill", "Allison"]);    expect(results.elected.length).toBe(2);
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
