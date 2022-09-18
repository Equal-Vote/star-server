const StarResults = require('./StarResults')

describe("STAR Tests", () => {
    test("Condorcet Winner", () => {
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const votes = [
            [5, 2, 1, 4],
            [5, 2, 1, 0],
            [5, 2, 1, 0],
            [5, 2, 1, 0],
            [5, 3, 4, 0],
            [5, 1, 4, 0],
            [5, 1, 4, 0],
            [4, 0, 5, 1],
            [3, 4, 5, 0],
            [3, 5, 5, 5]]
        const results = StarResults(candidates, votes, 1)
        expect(results.elected[0].name).toBe('Allison');
        expect(results.round_results[0].runner_up[0].name).toBe('Carmen');
    })
    test("Runnerup tie", () => {
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const votes = [
            [5, 4, 3, 3],
            [4, 5, 1, 1],
            [4, 5, 1, 2],
            [3, 5, 1, 0],
            [5, 4, 3, 0],
            [5, 0, 4, 1],
            [5, 0, 4, 0],
            [4, 0, 5, 1],
            [3, 4, 5, 0],
            [3, 5, 5, 4]]
        const results = StarResults(candidates, votes, 1)
        expect(results.elected[0].name).toBe('Allison');
    })
    test("Runoff", () => {
        const candidates = ['Allison', 'Bill']
        const votes = [
            [0, 5],
            [2, 4],
        ]
        const results = StarResults(candidates, votes, 1)
        expect(results.elected[0].name).toBe('Bill');
    })
    test("Runoff tie, score resolves", () => {
        const candidates = ['Allison', 'Bill']
        const votes = [
            [0, 5],
            [3, 2],
        ]
        const results = StarResults(candidates, votes, 1)
        expect(results.elected[0].name).toBe('Bill');
    })
    test("Two tied for highest-scoring, runoff resolves", () => {
        const candidates = ['Allison', 'Bill']
        const votes = [
            [0, 2],
            [1, 2],
            [4, 1],
        ]
        const results = StarResults(candidates, votes, 1)
        expect(results.elected[0].name).toBe('Bill');
    })
    test("True Tie", () => {
        const candidates = ['Allison', 'Bill']
        const votes = [
            [1, 3],
            [4, 2],
        ]
        const results = StarResults(candidates, votes, 1)
        const logs = results.round_results[0].logs
        expect(logs[logs.length - 1].slice(0, 8)).toBe('True tie');//Need better tie reporting?
    })
    test("Score tiebreaker, condorcet resolves", () => {
        const candidates = ['Allison', 'Bill', 'Carmen']
        const votes = [
            [5, 2, 3],
            [5, 2, 3],
            [5, 2, 0],
        ]
        const results = StarResults(candidates, votes, 1)
        expect(results.elected[0].name).toBe('Allison');
        expect(results.round_results[0].runner_up[0].name).toBe('Carmen');
    })
    test("Score true tie for second, top scorer wins either way", () => {
        const candidates = ['Allison', 'Bill', 'Carmen']
        const votes = [
            [5, 2, 3],
            [5, 2, 3],
            [4, 3, 2],
            [1, 4, 3],
        ]
        const results = StarResults(candidates, votes, 1)
        expect(results.elected[0].name).toBe('Allison');
    })
    test("Score true tie for second, runoff ties either way and top scorer wins", () => {
        const candidates = ['Allison', 'Bill', 'Carmen']
        const votes = [
            [5, 2, 3],
            [5, 2, 3],
            [1, 3, 2],
            [1, 4, 3],
        ]
        const results = StarResults(candidates, votes, 1)
        expect(results.elected[0].name).toBe('Allison');
    })
    test("Three way score tie, condorce winners resolve", () => {
        const candidates = ['Allison', 'Bill', 'Carmen']
        const votes = [
            [2, 1, 0],
            [2, 1, 0],
            [2, 1, 0],
            [2, 1, 0],
            [1, 0, 0],
            [0, 0, 4],
            [0, 5, 5],
        ]
        const results = StarResults(candidates, votes, 1)
        expect(results.elected[0].name).toBe('Allison');
        expect(results.round_results[0].runner_up[0].name).toBe('Bill');
    })
    test("Three way score tie, two winners, true tie in runoff", () => {
        const candidates = ['Allison', 'Bill']
        const votes = [
            [2, 2, 0],
            [2, 2, 0],
            [1, 1, 5],
        ]
        const results = StarResults(candidates, votes, 1)
        const logs = results.round_results[0].logs
        expect(logs[logs.length - 1].slice(0, 8)).toBe('True tie');//Need better tie reporting?
    })
    test("Three way score tie, no condorcet winners", () => {
        const candidates = ['Allison', 'Bill']
        const votes = [
            [5, 5, 5],
            [2, 2, 2],
        ]
        const results = StarResults(candidates, votes, 1)
        const logs = results.round_results[0].logs
        expect(logs[logs.length - 1].slice(0, 8)).toBe('True tie');//Need better tie reporting?
    })
})