import express from 'express';
import { testMockUserStore } from './auth/test/TestMockUserStore';
import StarResults from './StarResults.cjs';
<<<<<<< HEAD
import { tempTestSuite } from './test/TempTestSuite';
=======
>>>>>>> d33e9f359e84198ef54255878f90a115777c00cd

const app = express();

//Example data structures that would be sent in API responses
const Elections = require('./Elections')
const Election = require('./Election')
const Ballots = new Array();
const ElectionResults = require('./ElectionResults')

const frontendPath = '../../../../frontend/build/';

//app.use(logger);
function GetResultsByID(electionID: number) {
    // console.log('Looking For Ballots for Election:')
    // console.log(electionID)
    const ballots = Ballots.filter(Ballot  => parseInt(Ballot.ElectionID) === electionID );
    // console.log(ballots)
    const cvr = ballots.map((ballot:any) => (
        ballot.candidateScores.map((candidateScore:any) =>(
            candidateScore.score
        ))
    ))
    const candidateNames = Elections[electionID].Candidates.map((Candidate:any) =>( Candidate.CandidateName))
    const results = StarResults(candidateNames,cvr)
    return results
}
const path = require('path');
app.use(express.static(path.join(__dirname, frontendPath)));
app.use(express.json());

// Get election from id
app.get('/API/Election/:id', (req, res) => {
    res.json(Elections[req.params.id])
})

// Get election results from id
app.get('/API/ElectionResult/:id', (req, res) => {
    res.json(GetResultsByID(parseInt(req.params.id)))

})

// Get all elections
app.get('/API/Elections', (req, res) => {
    res.json(Elections)
})

// Create New Election
app.post('/API/Elections', (req, res) => {
    const Candidates = req.body.Election.Candidates.map((CandidateName:any,ind:any) => ({id: ind,CandidateName: CandidateName}))
    const newElection = {
        id: Elections.length,
        ElectionName: req.body.Election.ElectionName,
        Candidates: Candidates,
    }
    Elections.push(newElection)
    console.log(Elections)
})

// Submit Ballot
app.post('/API/Election/:id', (req, res) => {
console.log('Ballot Submitted')
Ballots.push(req.body)
console.log(Ballots)

})

// Just for debugging
app.get('/debug/', (req, res) => {
<<<<<<< HEAD
    res.json("19:40")
})

app.get('/debug/test', (req, res) => {
    tempTestSuite().then(
=======
    res.json("15:29")
})

app.get('/debug/test', (req, res) => {
    testMockUserStore().then(
>>>>>>> d33e9f359e84198ef54255878f90a115777c00cd
        val => {
            res.json(val);
        }
    ).catch(
        err => {
            console.log(err);
            res.json(err);
        }
    )
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, frontendPath + "index.html"));
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

