import express from 'express';
import { Election } from '../../domain_model/Election';
import { testMockUserStore } from './auth/test/TestMockUserStore';
import StarResults from './StarResults.cjs';

const app = express();

//Example data structures that would be sent in API responses
const Elections = [] as Election[];//require('./Elections')
const SampleElection = require('./SampleElection')
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
    console.log(Elections[electionID].polls[0])
    const candidateNames = Elections[electionID].polls[0].candidates.map((Candidate:any) =>( Candidate.shortName))
    const results = StarResults(candidateNames,cvr)
    return results
}
const path = require('path');
app.use(express.static(path.join(__dirname, frontendPath)));
app.use(express.json());

// Get election from id
app.get('/API/Election/:id', (req, res) => {
    res.json(Elections[parseInt(req.params.id)])
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
    // const Candidates = req.body.Election.Candidates.map((CandidateName:any,ind:any) => ({id: ind,CandidateName: CandidateName}))
    // const newElection = {
    //     id: Elections.length,
    //     ElectionName: req.body.Election.ElectionName,
    //     Candidates: Candidates,
    // }
    const newElection = req.body.Election as Election;
    newElection.electionId = String(Elections.length);
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
    res.json("15:29")
})

app.get('/debug/test', (req, res) => {
    testMockUserStore().then(
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

