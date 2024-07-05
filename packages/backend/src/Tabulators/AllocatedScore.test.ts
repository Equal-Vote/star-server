import { AllocatedScore } from './AllocatedScore'

describe("Allocated Score Tests", () => {
    test("Basic Example", () => {
        // Two winners, two main parties, Allison wins first round with highest score, 1 quota of voters are allocated reducing Bill's score to zero
        // Carmen's score is reduced some causing Doug to win second 
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
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
            [0, 0, 4, 5]]
        const results = AllocatedScore(candidates, votes, 2, [], false, false)
        expect(results.elected.length).toBe(2);
        expect(results.elected[0].name).toBe('Allison');
        expect(results.elected[1].name).toBe('Doug');
        expect(results.summaryData.weightedScoresByRound[0]).toStrictEqual([25, 24, 24, 23]);  
        expect(results.summaryData.weightedScoresByRound[1]).toStrictEqual([0, 0, 16, 23]);  
    })
    test("Fractional surplus", () => {
        // Two winners, two main parties, Allison wins first round with highest score, Allison has 8 highest level supporters, more than the quota of 6 voters
        // Voters who gave Allison their highest score have their ballot weight reduced to (1-6/8) = 0.25
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const votes = [
            [5, 5, 1, 0],// Ballot weight reduced to 0.25 after first round
            [5, 5, 1, 0],// Ballot weight reduced to 0.25 after first round
            [5, 5, 1, 0],// Ballot weight reduced to 0.25 after first round
            [5, 5, 1, 0],// Ballot weight reduced to 0.25 after first round
            [5, 5, 1, 0],// Ballot weight reduced to 0.25 after first round
            [5, 5, 1, 0],// Ballot weight reduced to 0.25 after first round
            [5, 5, 1, 0],// Ballot weight reduced to 0.25 after first round
            [5, 4, 4, 0],// Ballot weight reduced to 0.25 after first round
            [0, 0, 0, 3],
            [0, 0, 4, 5],
            [0, 0, 4, 5],
            [0, 0, 4, 5]]
        const results = AllocatedScore(candidates, votes, 2, [], false, false)
        expect(results.elected.length).toBe(2);
        expect(results.elected[0].name).toBe('Allison');
        expect(results.elected[1].name).toBe('Doug');
        expect(results.summaryData.weightedScoresByRound[0]).toStrictEqual([40, 39, 23, 18]);  
        expect(results.summaryData.weightedScoresByRound[1]).toStrictEqual([0, 9.75, 14.75, 18]);
    })

    test("Fractional surplus on lower split", () => {
        // Two winners, two main parties, Allison wins first round with highest score, Allison has 8 highest level supporters, more than the quota of 6 voters
        // 4 gave Allison 5s, 4 gave Allison 4s. The 5's contribute 100% of their ballot weight to the quota bring the quota to 4/6 filled
        // 4 who gave Allison 4s share remaining 2/6 quota equally, reducing their ballot weight to 0.5
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const votes = [
            [4, 4, 1, 0],// Ballot weight reduced to 0.50 after first round
            [4, 4, 1, 0],// Ballot weight reduced to 0.50 after first round
            [4, 4, 1, 0],// Ballot weight reduced to 0.50 after first round
            [4, 4, 1, 0],// Ballot weight reduced to 0.50 after first round
            [5, 5, 1, 0],// Ballot weight reduced to 0 after first round
            [5, 5, 1, 0],// Ballot weight reduced to 0 after first round
            [5, 5, 1, 0],// Ballot weight reduced to 0 after first round
            [5, 4, 4, 0],// Ballot weight reduced to 0 after first round
            [0, 0, 0, 3],
            [0, 0, 4, 5],
            [0, 0, 4, 5],
            [0, 0, 4, 5]]
        const results = AllocatedScore(candidates, votes, 2, [], false, false)
        expect(results.elected.length).toBe(2);
        expect(results.elected[0].name).toBe('Allison');
        expect(results.elected[1].name).toBe('Doug');
        expect(results.summaryData.weightedScoresByRound[0]).toStrictEqual([36, 35, 23, 18]);  
        expect(results.summaryData.weightedScoresByRound[1]).toStrictEqual([0, 8, 14, 18]);
    })

    test("Random Tiebreaker", () => {
        // Two winners, two candidates tie for first
        // Tiebreak order not defined, select lower index
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
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
            [0, 0, 4, 5]]
        const results = AllocatedScore(candidates, votes, 2, [], true, false)
        expect(results.elected.length).toBe(2);
        expect(results.tied[0].length).toBe(2); // two candidates tied in forst round
        expect(results.elected[0].name).toBe('Allison') // random tiebreaker, second place lower index 1
        expect(results.elected[1].name).toBe('Doug');
    })

    test("Random Tiebreaker, tiebreak order defined", () => {
        // Two winners, two candidates tie for first
        // Tiebreak order defined, select lower
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
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
            [0, 0, 4, 5]]
        const results = AllocatedScore(candidates, votes, 2, [4,3,2,1], true, false)
        expect(results.elected.length).toBe(2);
        expect(results.tied[0].length).toBe(2); // two candidates tied in forst round
        expect(results.elected[0].name).toBe('Bill') // random tiebreaker, second place lower index 1
        expect(results.elected[1].name).toBe('Doug');
    })

    test("Test valid/invalid/under/bullet vote counts", () => {
        const candidates = ['Allison', 'Bill', 'Carmen']
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
        ]
        const results = AllocatedScore(candidates, votes, 1, [], false, false)
        expect(results.summaryData.nValidVotes).toBe(8);
        expect(results.summaryData.nInvalidVotes).toBe(2);
        expect(results.summaryData.nUnderVotes).toBe(2);
        expect(results.summaryData.nBulletVotes).toBe(3);
    })
})
