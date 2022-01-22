import { Election } from '../../../domain_model/Election';

// Temporary in memory storage of election data
const Elections = [] as Election[];//require('./Elections')

function getElectionByID(electionID: number) {
    // returns election for input ID, will need rework when database is implemented
    const election = Elections.filter(Election  => parseInt(Election.electionId) === electionID );
    return election[0]
}

function getElections() {
    console.log('Getting Elections')
    return Elections
}

function createElection(newElection: Election) {
    newElection.electionId = String(Elections.length);
    Elections.push(newElection)
    console.log(Elections)
}

module.exports = { 
    getElectionByID,
    getElections,
    createElection
}