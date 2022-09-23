import { Star } from './Star'
describe("STAR Tests", () => {
    test("Condorcet Winner", () => {
        // Simple test to elect the candidate that is the highest scoring and condorcet winner
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
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected[0].name).toBe('Allison');
        expect(results.roundResults[0].runner_up[0].name).toBe('Carmen');
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
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected[0].name).toBe('Allison');
        expect(results.roundResults[0].runner_up[0].name).toBe('Bill');
        // expect(results.tied.length).toBe(2)

    })
    test("Runoff", () => {
        // Simple runoff test, second candidate wins
        const candidates = ['Allison', 'Bill']
        const votes = [
            [0, 5],
            [2, 4],
        ]
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected[0].name).toBe('Bill');
        expect(results.roundResults[0].runner_up[0].name).toBe('Allison');
    })
    test("Runoff tie, score resolves", () => {
        // Two candidates tie in runoff round, highest scoring candidate wins
        const candidates = ['Allison', 'Bill']
        const votes = [
            [0, 5],
            [3, 2],
        ]
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected[0].name).toBe('Bill');
        expect(results.roundResults[0].runner_up[0].name).toBe('Allison');
    })
    test("Two tied for highest-scoring, runoff resolves", () => {
        // Two candidates tie in scoring round, condorcet winner advances first
        const candidates = ['Allison', 'Bill']
        const votes = [
            [0, 2],
            [1, 2],
            [4, 1],
        ]
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected[0].name).toBe('Bill');
        // Check that bill advanced first
        expect(results.roundResults[0].logs[1].slice(0,4)).toBe('Bill')
    })
    test("True Tie", () => {
        // Both candidates have same score and runoff votes, no extra tie breaker selected
        const candidates = ['Allison', 'Bill']
        const votes = [
            [1, 3],
            [4, 2],
        ]
        const results = Star(candidates, votes, 1, false, false)
        // No candidates elected
        expect(results.elected.length).toBe(0);
        // Two candidates marked as tied
        expect(results.tied.length).toBe(2);
    })
    test("True Tie, use five-star tiebreaker to resolve", () => {
        // Both candidates have same score and runoff votes, five star tiebreaker selected, one candidate wins 
        const candidates = ['Allison', 'Bill']
        const votes = [
            [2, 4],
            [5, 3],
        ]
        const results = Star(candidates, votes, 1, false, true)
        expect(results.elected[0].name).toBe('Allison');
        expect(results.elected.length).toBe(1);
        expect(results.tied.length).toBe(0);
    })
    test("True Tie, use five-star tiebreaker, still tied", () => {
        // Both candidates have same score and runoff votes, five star tiebreaker selected, candidates still tied 
        const candidates = ['Allison', 'Bill']
        const votes = [
            [1, 3],
            [4, 2],
        ]
        const results = Star(candidates, votes, 1, false, true)
        // No candidates elected
        expect(results.elected.length).toBe(0);
        // Two candidates marked as tied
        expect(results.tied.length).toBe(2);
    })
    test("Score tiebreaker, score tiebreaker resolves", () => {
        // Score tiebreaker for second runoff position, score tiebreaker resolves and advances candidate
        const candidates = ['Allison', 'Bill', 'Carmen']
        const votes = [
            [5, 2, 3],
            [5, 2, 3],
            [5, 2, 0],
        ]
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected[0].name).toBe('Allison');
        expect(results.roundResults[0].runner_up[0].name).toBe('Carmen');
    })
    test("Score true tie for second, could not resolve tie", () => {
        // Two candidates tied for second, could not resolve tie, mark all three as tied
        const candidates = ['Allison', 'Bill', 'Carmen']
        const votes = [
            [5, 2, 3],
            [5, 2, 3],
            [4, 3, 2],
            [1, 4, 3],
        ]
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected.length).toBe(0);
        expect(results.tied.length).toBe(3);
    })
    test("Three way score tie, condorce winners resolve", () => {
        // Three candidates tied in score round, score tiebreakers advances two candidates
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
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected[0].name).toBe('Allison');
        expect(results.roundResults[0].runner_up[0].name).toBe('Bill');
    })
    test("Three way score tie, two winners, true tie in runoff", () => {
        // Three candidates tied in score round, score tiebreakers advances two candidates, two runoff candidates tie in runoff

        const candidates = ['Allison', 'Bill', 'Carmen']
        const votes = [
            [2, 2, 0],
            [2, 2, 0],
            [1, 1, 5],
        ]
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected.length).toBe(0);
        expect(results.tied.length).toBe(2);
        const tiednames = [results.tied[0].name, results.tied[1].name]
        expect(tiednames).toContain('Allison')
        expect(tiednames).toContain('Bill')
    })
    test("Three way score tie, no condorcet winners", () => {
        const candidates = ['Allison', 'Bill', 'Carmen']
        const votes = [
            [5, 5, 5],
            [2, 2, 2],
        ]
        const results = Star(candidates, votes, 1, false, false)
        expect(results.elected.length).toBe(0);
        expect(results.tied.length).toBe(3);
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
        const results = Star(candidates, votes, 1, false, false)
        expect(results.summaryData.nValidVotes).toBe(6);
        expect(results.summaryData.nInvalidVotes).toBe(2);
        expect(results.summaryData.nUnderVotes).toBe(2);
        expect(results.summaryData.nBulletVotes).toBe(3);
    })
})