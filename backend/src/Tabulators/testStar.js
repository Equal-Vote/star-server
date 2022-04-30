const StarResults = require('./StarResults')

const candidates = ['Alice','Bob','Carol','Dave']

const votes = [
    [0,0,0,1],
    [1,1,0,0],
    [1,0,5,0],
    [0,0,0,1],
    [0,0,0,1],
]


const results = StarResults(candidates,votes)
console.log(results)