import { Approval } from './Approval'

describe("Approval Tests", () => {
    test("Single Winner Test", () => {
        // Simple test to elect the candidate with most votes
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 2],
            [0, 0, -1, 0],
        ]
        const results = Approval(candidates, votes)
        expect(results.elected.length).toBe(1);
        expect(results.elected[0].name).toBe('Dave');
        expect(results.summaryData.totalScores[0].score).toBe(7)
        expect(results.summaryData.totalScores[0].index).toBe(3)
        expect(results.summaryData.totalScores[1].score).toBe(6)
        expect(results.summaryData.totalScores[1].index).toBe(2)
        expect(results.summaryData.totalScores[2].score).toBe(3)
        expect(results.summaryData.totalScores[2].index).toBe(1)
        expect(results.summaryData.totalScores[3].score).toBe(1)
        expect(results.summaryData.totalScores[3].index).toBe(0)
        
        expect(results.summaryData.nUnderVotes).toBe(1)
        expect(results.summaryData.nValidVotes).toBe(8)
        expect(results.summaryData.nInvalidVotes).toBe(2)
    })

    test("Multi Winner Test", () => {
        // Simple test to elect the candidate with most votes
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 1],
        ]
        const results = Approval(candidates, votes,2)
        expect(results.elected.length).toBe(2);
        expect(results.elected[0].name).toBe('Dave');
        expect(results.elected[1].name).toBe('Carol');
        expect(results.summaryData.totalScores[0].score).toBe(7)
        expect(results.summaryData.totalScores[0].index).toBe(3)
        expect(results.summaryData.totalScores[1].score).toBe(6)
        expect(results.summaryData.totalScores[1].index).toBe(2)
        expect(results.summaryData.totalScores[2].score).toBe(3)
        expect(results.summaryData.totalScores[2].index).toBe(1)
        expect(results.summaryData.totalScores[3].score).toBe(1)
        expect(results.summaryData.totalScores[3].index).toBe(0)
        
        expect(results.summaryData.nUnderVotes).toBe(0)
        expect(results.summaryData.nValidVotes).toBe(7)
        expect(results.summaryData.nInvalidVotes).toBe(0)
    })

    test("Ties Test", () => {
        // Tie for second
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 0, 0, 1],
        ]
        const results = Approval(candidates, votes)
        expect(results.elected.length).toBe(1);
        expect(results.elected[0].name).toBe('Dave');
        expect(results.summaryData.totalScores[0].score).toBe(7)
        expect(results.summaryData.totalScores[0].index).toBe(3)
        expect(results.summaryData.totalScores[1].score).toBe(6)
        expect([1,2]).toContain(results.summaryData.totalScores[1].index)
        expect(results.summaryData.totalScores[2].score).toBe(6)
        expect([1,2]).toContain(results.summaryData.totalScores[2].index)
        expect(results.summaryData.totalScores[3].score).toBe(1)
        expect(results.summaryData.totalScores[3].index).toBe(0)
        
        expect(results.summaryData.nUnderVotes).toBe(0)
        expect(results.summaryData.nValidVotes).toBe(7)
        expect(results.summaryData.nInvalidVotes).toBe(0)
    })
})