const express = require('express');

const app = express();

//Example data structures that would be sent in API responses
const Elections = require('./Elections')
const Election = require('./Election')
const ElectionResults = require('./ElectionResults')

const logger = (req,res,next) => {
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
}

app.use(logger);

// Get election from id
app.get('/Election/:id', (req,res) => {
    res.json(Election)
})

// Get election results from id
app.get('/ElectionResult/:id', (req,res) => {
    res.json(ElectionResults)

})

// Get all elections
app.get('/Elections', (req,res) => {
    res.json(Elections)
})

// Create New Election
app.post('/Elections', (req,res) => {
    const newElection = {
        ElectionName: req.body.ElectionName,
        CandidateNames: req.body.CandidateNames,
    }

    
})

const PORT = process.env.PORT || 5000;

app.listen(PORT,() => console.log(`Server started on port ${PORT}`));

