const ParseData = require('./ParseData')

const candidates = ['Alice','Bob','Carol','Dave']

const votes = [
    [0,0,0,1],
    [1,1,0,0],
    [1,0,5,0],
    [0,0,0,1],
    [0,0,0,1],
]

const results = ParseData(candidates,votes,0,5,5,true)

console.log(results)