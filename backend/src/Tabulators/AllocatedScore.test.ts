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
        const results = AllocatedScore(candidates, votes, 2, false, false)
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
            [0, 0, 4, 5]]
        const results = AllocatedScore(candidates, votes, 2, false, false)
        expect(results.elected.length).toBe(2);
        expect(results.elected[0].name).toBe('Allison');
        expect(results.elected[1].name).toBe('Doug');
        expect(results.summaryData.weightedScoresByRound[0]).toStrictEqual([40, 39, 23, 18]);  
        expect(results.summaryData.weightedScoresByRound[1]).toStrictEqual([0, 9.75, 14.75, 18]);
    })

    test("Random Tiebreaker", () => {
        // Two winners, two candidates tie for first, break tie randomly
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
        const results = AllocatedScore(candidates, votes, 2, true, false)
        expect(results.elected.length).toBe(2);
        expect(results.tied[0].length).toBe(2); // two candidates tied in forst round
        expect(['Allison','Bill']).toContain(results.elected[0].name) // random tiebreaker, second place can either be Allison or Bill
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
        const results = AllocatedScore(candidates, votes, 1, false, false)
        expect(results.summaryData.nValidVotes).toBe(8);
        expect(results.summaryData.nInvalidVotes).toBe(2);
        expect(results.summaryData.nUnderVotes).toBe(2);
        expect(results.summaryData.nBulletVotes).toBe(3);
    })
})
