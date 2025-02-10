import { STV } from './IRV'

describe("STV Tests", () => {
    test("Two winner test", () => {
        // Simple two winner STV test.
        // Shows fractional surplus and candidate elimination works
        
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 2, 3, 4, 0],
            [1, 2, 3, 4, 0],
            [1, 2, 3, 4, 0],
            [1, 2, 3, 4, 0],
            [1, 2, 3, 4, 0],
            [2, 1, 3, 4, 0],
            [2, 1, 3, 4, 0],
            [2, 3, 1, 4, 0],
            [2, 3, 4, 1, 0],
        ]
        const results = STV(candidates, votes,2)
        expect(results.elected.length).toBe(2); 
        expect(results.elected[0].name).toBe('Alice');
        expect(results.elected[1].name).toBe('Bob');
        expect(results.voteCounts.length).toBe(3); 
        expect(results.voteCounts[0]).toStrictEqual([5,2,1,1]);  
        expect(results.voteCounts[1]).toStrictEqual([0,3,1,1]);  // first 5 voters weight reduced to 1/5 and transfered to Bob
        expect(results.voteCounts[2]).toStrictEqual([0,4,1,0]);  // Dave eliminated and transfered to Bob

    })

})