import express from 'express';

const app = express();

//Example data structures that would be sent in API responses
const Elections = require('./Elections')
const Election = require('./Election')
const ElectionResults = require('./ElectionResults')

const frontendPath = '../../frontend/build/';

// const logger = (req,res,next) => {
//     console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
//     next();
// }
//app.use(logger);

const path = require('path');
app.use(express.static(path.join(__dirname, frontendPath)));

// Get election from id
app.get('/API/Election/:id', (req,res) => {
    res.json(Election)
})

// Get election results from id
app.get('/API/ElectionResult/:id', (req,res) => {
    res.json(ElectionResults)

})

// Get all elections
app.get('/API/Elections', (req,res) => {
    res.json(Elections)
})

// Create New Election
app.post('/API/Elections', (req,res) => {
    const newElection = {
        ElectionName: req.body.ElectionName,
        CandidateNames: req.body.CandidateNames,
    }
})

// Get all elections
app.get('/debug/', (req,res) => {
    res.json("12:27")
})

app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname, frontendPath + "index.html"));
})

const PORT = process.env.PORT || 5000;

app.listen(PORT,() => console.log(`Server started on port ${PORT}`));

