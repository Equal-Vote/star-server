const PluralityResults = require('./PluralityResults')

const candidates = ['Alice','Bob','Carol','Dave']

const votes = [
    [0,0,0,1],
    [1,0,0,0],
    [1,0,0,0],
    [0,0,0,1],
    [0,0,0,1],
]


const results = PluralityResults(candidates,votes)