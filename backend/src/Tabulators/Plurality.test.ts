import { Plurality } from './Plurality'

describe("Plurality Tests", () => {
    test("Single Winner Test", () => {
        // Simple test to elect the candidate with most votes
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 2],
            [0, 0, -1, 0],
            [1, 0, 0, 1],
        ]
        const results = Plurality(candidates, votes)
        expect(results.elected.length).toBe(1);
        expect(results.elected[0].name).toBe('Dave');
        expect(results.summaryData.totalScores[0].score).toBe(5)
        expect(results.summaryData.totalScores[0].index).toBe(3)
        expect(results.summaryData.totalScores[1].score).toBe(3)
        expect(results.summaryData.totalScores[1].index).toBe(2)
        expect(results.summaryData.totalScores[2].score).toBe(2)
        expect(results.summaryData.totalScores[2].index).toBe(1)
        expect(results.summaryData.totalScores[3].score).toBe(0)
        expect(results.summaryData.totalScores[3].index).toBe(0)
        
        expect(results.summaryData.nUnderVotes).toBe(1)
        expect(results.summaryData.nValidVotes).toBe(11)
        expect(results.summaryData.nInvalidVotes).toBe(3)
    })

    test("Multi Winner Test", () => {
        // Simple test to elect the candidate with most votes
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
        ]
        const results = Plurality(candidates, votes)
        expect(results.elected.length).toBe(1);
        expect(results.elected[0].name).toBe('Dave');
        expect(results.summaryData.totalScores[0].score).toBe(5)
        expect(results.summaryData.totalScores[0].index).toBe(3)
        expect(results.summaryData.totalScores[1].score).toBe(3)
        expect(results.summaryData.totalScores[1].index).toBe(2)
        expect(results.summaryData.totalScores[2].score).toBe(2)
        expect(results.summaryData.totalScores[2].index).toBe(1)
        expect(results.summaryData.totalScores[3].score).toBe(0)
        expect(results.summaryData.totalScores[3].index).toBe(0)
        
        expect(results.summaryData.nUnderVotes).toBe(0)
        expect(results.summaryData.nValidVotes).toBe(10)
        expect(results.summaryData.nInvalidVotes).toBe(0)
    })

    test("Ties Test", () => {
        // Tie for second
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
        ]
        const results = Plurality(candidates, votes)
        expect(results.elected.length).toBe(1);
        expect(results.elected[0].name).toBe('Dave');
        expect(results.summaryData.totalScores[0].score).toBe(5)
        expect(results.summaryData.totalScores[0].index).toBe(3)
        expect(results.summaryData.totalScores[1].score).toBe(3)
        expect([1,2]).toContain(results.summaryData.totalScores[1].index)
        expect(results.summaryData.totalScores[2].score).toBe(3)
        expect([1,2]).toContain(results.summaryData.totalScores[2].index)
        expect(results.summaryData.totalScores[3].score).toBe(0)
        expect(results.summaryData.totalScores[3].index).toBe(0)
        
        expect(results.summaryData.nUnderVotes).toBe(0)
        expect(results.summaryData.nValidVotes).toBe(11)
        expect(results.summaryData.nInvalidVotes).toBe(0)
    })
})