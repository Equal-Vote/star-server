import { RankedRobin } from './RankedRobin'

describe("Ranked Robin Tests", () => {
    test("Single winner test", () => {
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 2, 3, 0],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 1, 2, 3],
            [1, 1, 2, 3],
            [2, 1, 3, 4],
            [2, 1, 3, 4],
            [2, 3, 1, 4],
            [2, 3, 4, 1],
            [0, 0, 0, 0],
            [2, 3, 4, -1],
        ]

        const results = RankedRobin(candidates, votes)
        expect(results.summaryData.nAbstentions).toBe(1)
        expect(results.summaryData.nOutOfBoundsVotes).toBe(1)
        expect(results.summaryData.nTallyVotes).toBe(9)

        expect(results.elected[0].name).toBe('Alice');
        expect(results.elected.length).toBe(1);
        expect(results.summaryData.preferenceMatrix[0]).toStrictEqual([0,5,8,8]);  
        expect(results.summaryData.preferenceMatrix[1]).toStrictEqual([2,0,8,8]);  
        expect(results.summaryData.preferenceMatrix[2]).toStrictEqual([1,1,0,8]);  
        expect(results.summaryData.preferenceMatrix[3]).toStrictEqual([1,1,1,0]);  
        expect(results.summaryData.pairwiseMatrix[0]).toStrictEqual([0,1,1,1]);  
        expect(results.summaryData.pairwiseMatrix[1]).toStrictEqual([0,0,1,1]);  
        expect(results.summaryData.pairwiseMatrix[2]).toStrictEqual([0,0,0,1]);  
        expect(results.summaryData.pairwiseMatrix[3]).toStrictEqual([0,0,0,0]);  
        
        expect(results.summaryData.totalScores[0].index).toBe(0);  
        expect(results.summaryData.totalScores[0].score).toBe(3);  
        expect(results.summaryData.totalScores[1].index).toBe(1);  
        expect(results.summaryData.totalScores[1].score).toBe(2);  
        expect(results.summaryData.totalScores[2].index).toBe(2);  
        expect(results.summaryData.totalScores[2].score).toBe(1);  
        expect(results.summaryData.totalScores[3].index).toBe(3);  
        expect(results.summaryData.totalScores[3].score).toBe(0); 
    })    
    test("Muilti winner test", () => {
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 2, 3, 0],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 1, 2, 3],
            [1, 1, 2, 3],
            [2, 1, 3, 4],
            [2, 1, 3, 4],
            [2, 3, 1, 4],
            [2, 3, 4, 1],
        ]
        const results = RankedRobin(candidates, votes,2)
        expect(results.summaryData.nAbstentions).toBe(0)
        expect(results.summaryData.nOutOfBoundsVotes).toBe(0)
        expect(results.summaryData.nTallyVotes).toBe(9)

        expect(results.elected.length).toBe(2);
        expect(results.elected[0].name).toBe('Alice');
        expect(results.elected[1].name).toBe('Bob');
    })
    test("Ties", () => {
        // Tiebreak order not defined, select lower index
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [2, 1, 3, 4],
            [2, 1, 3, 4],
            [2, 1, 3, 4],
        ]
        const results = RankedRobin(candidates, votes)
        expect(results.summaryData.nAbstentions).toBe(0)
        expect(results.summaryData.nTallyVotes).toBe(6)
        expect(results.summaryData.nOutOfBoundsVotes).toBe(0)

        expect(results.elected[0].name).toBe('Alice')
        expect(results.elected.length).toBe(1);
        expect(results.summaryData.preferenceMatrix[0]).toStrictEqual([0,3,6,6]);  
        expect(results.summaryData.preferenceMatrix[1]).toStrictEqual([3,0,6,6]);  
        expect(results.summaryData.preferenceMatrix[2]).toStrictEqual([0,0,0,6]);  
        expect(results.summaryData.preferenceMatrix[3]).toStrictEqual([0,0,0,0]);  
        expect(results.summaryData.pairwiseMatrix[0]).toStrictEqual([0,0,1,1]);  
        expect(results.summaryData.pairwiseMatrix[1]).toStrictEqual([0,0,1,1]);  
        expect(results.summaryData.pairwiseMatrix[2]).toStrictEqual([0,0,0,1]);  
        expect(results.summaryData.pairwiseMatrix[3]).toStrictEqual([0,0,0,0]);  
        
        expect(results.summaryData.totalScores[0].index).toBe(0);  
        expect(results.summaryData.totalScores[0].score).toBe(2);  
        expect(results.summaryData.totalScores[1].index).toBe(1);  
        expect(results.summaryData.totalScores[1].score).toBe(2);  
        expect(results.summaryData.totalScores[2].index).toBe(2);  
        expect(results.summaryData.totalScores[2].score).toBe(1);  
        expect(results.summaryData.totalScores[3].index).toBe(3);  
        expect(results.summaryData.totalScores[3].score).toBe(0); 

    })
    test("Ties, tiebreak order defined", () => {
        // Tiebreak order defined, select lower
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [2, 1, 3, 4],
            [2, 1, 3, 4],
            [2, 1, 3, 4],
        ]
        const results = RankedRobin(candidates, votes,1,[4,3,2,1])
        expect(results.elected[0].name).toBe('Bob')
        expect(results.elected.length).toBe(1);
    })
})