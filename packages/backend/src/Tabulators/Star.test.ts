import { Star, runStarRound } from './Star'
import { starSummaryData } from 'shared/domain_model/ITabulators'

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
        const results = Star(candidates, votes, 1, [], false, false)
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
        const results = Star(candidates, votes, 1, [],  false, false)
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
        const results = Star(candidates, votes, 1, [], false, false)
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
        const results = Star(candidates, votes, 1, [], false, false)
        expect(results.elected[0].name).toBe('Bill');
        expect(results.roundResults[0].runner_up[0].name).toBe('Allison');
    })
    test("True Tie, use five-star tiebreaker to resolve", () => {
        // Both candidates have same score and runoff votes, five star tiebreaker selected, one candidate wins 
        const candidates = ['Allison', 'Bill']
        const votes = [
            [2, 4],
            [5, 3],
        ]
        const results = Star(candidates, votes, 1, [], false, true)
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
        const results = Star(candidates, votes, 1, [], false, true)
        // No candidates elected
        expect(results.elected.length).toBe(0);
        // Two candidates marked as tied
        expect(results.tied.length).toBe(2);
    })
    test("True Tie, use five-star tiebreaker, still tied, select lower index", () => {
        // Both candidates have same score and runoff votes, five star tiebreaker selected, candidates still tied
        // Tie break order not defined, select winner based on index 
        const candidates = ['Allison', 'Bill']
        const votes = [
            [1, 3],
            [4, 2],
        ]
        const results = Star(candidates, votes, 1, [], true, true)
        // No candidates elected
        expect(results.elected[0].name).toBe('Allison');
        expect(results.elected.length).toBe(1);
        expect(results.tied.length).toBe(0);
    })
    test("True Tie, use five-star tiebreaker, still tied, tiebreak order defined", () => {
        // Both candidates have same score and runoff votes, five star tiebreaker selected, candidates still tied
        // Tie break order defined, select lower 
        const candidates = ['Allison', 'Bill']
        const votes = [
            [1, 3],
            [4, 2],
        ]
        const results = Star(candidates, votes, 1, [2,1], true, true)
        // No candidates elected
        expect(results.elected[0].name).toBe('Bill');
        expect(results.elected.length).toBe(1);
        expect(results.tied.length).toBe(0);
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
        const results = Star(candidates, votes, 1, [], false, false)
        expect(results.summaryData.nValidVotes).toBe(8);
        expect(results.summaryData.nInvalidVotes).toBe(2);
        expect(results.summaryData.nUnderVotes).toBe(2);
        expect(results.summaryData.nBulletVotes).toBe(3);
    })
})

function buildTestSummaryData(candidates: string[], scores: number[], pairwiseMatrix: number[][], fiveStarCounts: number[]) {
    return {
        candidates: candidates.map((candidate, index) => ({ index: index, name: candidate, tieBreakOrder: index })),
        totalScores: scores.map((score, index) => ({ index, score })),
        scoreHist: fiveStarCounts.map(count => [0, 0, 0, 0, 0, count]),
        preferenceMatrix: pairwiseMatrix,
        pairwiseMatrix: pairwiseMatrix,
        nValidVotes: 0,
        nInvalidVotes: 0,
        nUnderVotes: 0,
        nBulletVotes: 0
    } as starSummaryData
}

describe("STAR Score Round Tests", () => {
    // These tests bypass the main STAR function and test the runStarRound function
    // This lets us build the summary data objects directly with candidate scores, five star counts, and pairwise matrix
    // in order to more easily create unique election conditions and test edge cases. 
    // Note these conditions might not be realistic, just help cover any "what if" cases
    test("Simple score-runoff test", () => {
        // Simple test to elect the candidate that is the highest scoring and condorcet winner
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [10, 9, 8, 7]
        const pairwiseMatrix = [
            [0, 1, 1, 1], 
            [0, 0, 1, 1], 
            [0, 0, 0, 1], 
            [0, 0, 0, 0]]
        const fiveStarCounts = [3, 2, 1, 0]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Simple score-runoff test, second candidate wins", () => {
        // Simple test to elect the candidate that is the second highest scoring and condorcet winner
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [10, 9, 8, 7]
        const pairwiseMatrix = [
            [0, 0, 1, 1], 
            [1, 0, 1, 1], 
            [0, 0, 0, 1], 
            [0, 0, 0, 0]]
        const fiveStarCounts = [3, 2, 1, 0]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Bill');
        expect(roundResults.runner_up[0].name).toBe('Allison');
    })
    test("Score tie, both advance", () => {
        // Two candidates tie for highest score, but both can advance
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [10, 10, 8, 7]
        const pairwiseMatrix = [
            [0, 1, 1, 1], 
            [0, 0, 1, 1], 
            [0, 0, 0, 1], 
            [0, 0, 0, 0]]
        const fiveStarCounts = [3, 2, 1, 0]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Three way score tie for first, eliminate candidate with most losses", () => {
        // Three way score tie for first. 
        // Among the three candidates Carmen has two losses and is eliminated
        // Next Bill has one loss and is eliminated and Alison advances
        // For next runoff candidate Bill and Carmen are tied, Carmen is eliminated with one loss and Bill advances
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [10, 10, 10, 7]
        const pairwiseMatrix = [
            [0, 1, 1, 1], 
            [0, 0, 1, 1], 
            [0, 0, 0, 1], 
            [0, 0, 0, 0]]
        const fiveStarCounts = [3, 2, 1, 0]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Three way score tie for first, eliminate candidate with most losses", () => {
        // Three way score tie for first.
        // Among the three candidates Carmen has two losses and is eliminated
        // Next Alison and Bill have the same number of losses, but both can advance
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [10, 10, 10, 7]
        const pairwiseMatrix = [
            [0, 0, 1, 1], 
            [0, 0, 1, 1], 
            [0, 0, 0, 1], 
            [0, 0, 0, 0]]
        const fiveStarCounts = [3, 2, 1, 0]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, true)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Three way score tie for second, eliminate candidates with most losses", () => {
        // Three way score tie for second, candidates are eliminated same as above cases until Bill advances
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [11, 10, 10, 10]
        const pairwiseMatrix = [
            [0, 1, 1, 1], 
            [0, 0, 1, 1], 
            [0, 0, 0, 1], 
            [0, 0, 0, 0]]
        const fiveStarCounts = [3, 2, 1, 0]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Three way score tie for first, advance candidates with most five star votes", () => {
        // Three way score tie for first, condorcet cycle between the candidates
        // Proceed to five star tiebreaker
        // Allison and Bill both advance with the most counts
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [10, 10, 10, 9]
        const pairwiseMatrix = [
            [0, 1, 0, 1], 
            [0, 0, 1, 1], 
            [1, 0, 0, 1], 
            [0, 0, 0, 0]]
        const fiveStarCounts = [3, 3, 1, 0]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Three way score tie for first, advance one candidate with most five star votes", () => {
        // Three way score tie for first, condorcet cycle between the candidates
        // Proceed to five star tiebreaker
        // Only Allison advances with most counts
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [10, 10, 10, 9]
        const pairwiseMatrix = [
            [0, 1, 0, 1], 
            [0, 0, 1, 1], 
            [1, 0, 0, 1], 
            [0, 0, 0, 0]]
        const fiveStarCounts = [3, 2, 2, 0]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Four way score tie for first, eliminate candidates with least five star votes", () => {
        // Four way score tie for first, condorcet cycle between the candidates
        // Proceed to five star tiebreaker
        // Cannon advance a candidate, eliminate candidate with least counts
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [10, 10, 10, 10]
        const pairwiseMatrix = [
            [0, 1, 0, 0], 
            [0, 0, 1, 1], 
            [0, 0, 0, 0], 
            [1, 0, 0, 0]]
        const fiveStarCounts = [3, 3, 3, 2]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Three way score tie for second, eliminate candidates with least five star votes", () => {
        // Three way score tie for second, condorcet cycle between the candidates
        // Proceed to five star tiebreaker
        // Cannon advance a candidate, eliminate candidate with least counts
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [11, 10, 10, 10]
        const pairwiseMatrix = [
            [0, 1, 1, 1], 
            [0, 0, 1, 0], 
            [0, 0, 0, 1], 
            [0, 1, 0, 0]]
        const fiveStarCounts = [4, 3, 3, 2]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Three way score tie for second, advance with most five star votes", () => {
        // Three way score tie for first, condorcet cycle between the candidates
        // Proceed to five star tiebreaker
        // Cannon advance a candidate, eliminate candidate with least counts
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [11, 10, 10, 10]
        const pairwiseMatrix = [
            [0, 1, 1, 1], 
            [0, 0, 1, 0], 
            [0, 0, 0, 1], 
            [0, 1, 0, 0]]
        const fiveStarCounts = [4, 3, 2, 2]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up[0].name).toBe('Bill');
    })
    test("Three way true tie for second, random tiebreaker disabled, all selected as tied", () => {
        // Simple test to elect the candidate that is the highest scoring and condorcet winner
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [11, 10, 10, 10]
        const pairwiseMatrix = [
            [0, 1, 1, 1], 
            [0, 0, 1, 0], 
            [0, 0, 0, 1], 
            [0, 1, 0, 0]]
        const fiveStarCounts = [4, 3, 3, 3]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], false, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(4);
        expect(roundResults.winners[0].name).toBe('Allison');
        expect(roundResults.runner_up.length).toBe(0);
    })
    test("Three way true tie for second, pick random to advance", () => {
        // Simple test to elect the candidate that is the highest scoring and condorcet winner
        const candidates = ['Allison', 'Bill', 'Carmen', 'Doug']
        const scores = [11, 10, 10, 10]
        const pairwiseMatrix = [
            [0, 1, 1, 1], 
            [0, 0, 1, 0], 
            [0, 0, 0, 1], 
            [0, 1, 0, 0]]
        const fiveStarCounts = [4, 3, 3, 3]
        const summaryData = buildTestSummaryData(candidates, scores, pairwiseMatrix, fiveStarCounts)

        const roundResults = runStarRound(summaryData, [...summaryData.candidates], true, false)
        //console.log(roundResults.logs)
        expect(roundResults.winners.length).toBe(1);
        expect(roundResults.winners[0].name).toBe('Allison');
        //runner up doesn't matter here, but need test that random selection occurred
        //
    })
})