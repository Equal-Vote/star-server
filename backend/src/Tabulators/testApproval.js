const ApprovalResults = require('./ApprovalResults')

const candidates = ['Alice','Bob','Carol','Dave']

const votes = [
    [0,0,0,1],
    [1,0,0,0],
    [1,0,0,1],
    [0,0,0,1],
    [0,0,1,0],
]


const results = ApprovalResults(candidates,votes)
console.log(results)