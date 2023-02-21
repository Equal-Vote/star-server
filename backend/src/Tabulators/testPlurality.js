const PluralityResults = require('./PluralityResults')

// TODO: eventually we should make this a proper test class like Star.test.ts, but for now we can just add edge cases as we hit them

const candidates = ['Alice','Bob','Carol','Dave']

const votes = [
    [0,0,0,1],
    [1,0,0,0],
    [1,0,0,0],
    [0,0,0,1],
    [0,0,0,1],
]

const results = PluralityResults(candidates,votes)
console.log(results)

const votes2 = [
    [1,0,0,0],
]

const results2 = PluralityResults(candidates,votes)
console.log(results2)