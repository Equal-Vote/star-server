import { IRV } from './IRV'

describe("IRV Tests", () => {
    test("First round majority", () => {
        // Simple test to elect the candidate with most votes in first round
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [2, 1, 3, 4],
            [2, 1, 3, 4],
            [2, 3, 1, 4],
            [2, 3, 4, 1],
        ]
        const results = IRV(candidates, votes)
        expect(results.elected[0].name).toBe('Alice');
        expect(results.voteCounts.length).toBe(1);  //only single round
        expect(results.voteCounts[0]).toStrictEqual([5,2,1,1]);  
        
    })

    test("Multiwinner ", () => {
        // Simple multiwinner test, shows first winner's votes transfer correctly
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 3, 2, 4],
            [2, 1, 3, 4],
            [2, 1, 3, 4],
            [2, 3, 1, 4],
            [2, 3, 4, 1],
        ]
        const results = IRV(candidates, votes, 2)
        expect(results.elected.length).toBe(2); 
        expect(results.elected[0].name).toBe('Alice');
        expect(results.elected[1].name).toBe('Bob');
        expect(results.voteCounts.length).toBe(2); 
        expect(results.voteCounts[0]).toStrictEqual([5,2,1,1]);  
        expect(results.voteCounts[1]).toStrictEqual([0,6,2,1]);  
        
    })

    test("2 round test", () => {
        // Majority can't be found in first round
        const candidates = ['Alice', 'Bob', 'Carol']

        const votes = [
            [1, 2, 3],
            [1, 2, 3],
            [3, 2, 1],
            [3, 2, 1],
            [2, 1, 3],
        ]
        const results = IRV(candidates, votes)
        expect(results.elected[0].name).toBe('Alice');
        expect(results.voteCounts.length).toBe(2);  //Two rounds
        expect(results.voteCounts[0]).toStrictEqual([2,1,2]);  
        expect(results.voteCounts[1]).toStrictEqual([3,0,2]); 
    })
    test("Exhausted Ballots", () => {
        // Exhaust ballot if no remaining candidates
        const candidates = ['Alice', 'Bob', 'Carol']

        const votes = [
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
            [3, 2, 1],
            [3, 2, 1],
            [3, 2, 1],
            [3, 2, 1],
            [2, 1, 1],//first round overvote & exhausted
            [3, 2, 0],//no first rank, not exhausted
            [2, 1, 2],//second round overvote & exhausted
            [0, 1, 0],//second round exhausted vote
        ]
        const results = IRV(candidates, votes)
        expect(results.elected[0].name).toBe('Alice');
        expect(results.voteCounts.length).toBe(2);  //Two rounds
        expect(results.voteCounts[0]).toStrictEqual([4,3,4]);  
        expect(results.voteCounts[1]).toStrictEqual([5,0,4]);  
        expect(results.exhaustedVoteCounts).toStrictEqual([1,3]); 
    })
})