// const IRV = require('./IRV.ts')
import { IRV } from './IRV'

describe("IRV Tests", () => {
    test("IRV Test", () => {
        // Simple test to elect the candidate that is the highest scoring and condorcet winner
        const candidates = ['Alice', 'Bob', 'Carol', 'Dave']

        const votes = [
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [2, 1, 3, 4],
            [2, 1, 3, 4],
            [2, 3, 1, 4],
        ]
        const results = IRV(candidates, votes)
        console.log(results.voteCounts)
        expect(results.elected[0].name).toBe('Alice');
        // expect(results.runner_up[0].name).toBe('Carmen');
    })
    test("Center Squeeze", () => {
        // Simple test to elect the candidate that is the highest scoring and condorcet winner
        const candidates = ['Alice', 'Bob', 'Carol']

        const votes = [
            [1, 2, 3],
            [1, 2, 3],
            [3, 2, 1],
            [3, 2, 1],
            [2, 1, 3],
        ]
        const results = IRV(candidates, votes)
        console.log(results.voteCounts)
        expect(results.elected[0].name).toBe('Alice');
        // expect(results.runner_up[0].name).toBe('Carmen');
    })
    test("Exhausted Ballots", () => {
        // Simple test to elect the candidate that is the highest scoring and condorcet winner
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
            [2, 1, 1],
            [2, 1, 0],
            [0, 1, 0],
        ]
        const results = IRV(candidates, votes)
        console.log(results)
        console.log(results.exhaustedVoteCounts)
        console.log(results.overVoteCounts)
        expect(results.elected[0].name).toBe('Alice');
        // expect(results.runner_up[0].name).toBe('Carmen');
    })
})