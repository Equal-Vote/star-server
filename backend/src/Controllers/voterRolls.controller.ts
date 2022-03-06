import { Election } from '../../../domain_model/Election';
import { Ballot } from '../../../domain_model/Ballot';
import { Score } from '../../../domain_model/Score';
import { VoterRoll } from '../../../domain_model/VoterRoll';
const VoterRollDB = require('../Models/VoterRolls')
import StarResults from '../StarResults.cjs';

const { Pool } = require('pg');
// May need to use this ssl setting when using local database
// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
//     ssl:  false
// });
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
    ssl:  {
        rejectUnauthorized: false
      }
});
var VoterRollModel = new VoterRollDB(pool, "voterRollDB");
VoterRollModel.init();


const getRollsByElectionID = async (req: any, res: any, next: any) => {
    //requires election data in req, adds entire voter roll 
    try {
        const voterRoll = await VoterRollModel.getRollsByElectionID(req.election.election_id)
        if (!voterRoll)
            return res.status('400').json({
                error: "Election roll not found"
            })
        console.log(`Getting Election: ${req.params.id}`)
        console.log(voterRoll)
        req.voterRoll = voterRoll
        next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve voter roll"
        })
    }
}

const addVoterRoll = async (req: any, res: any, next: any) => {

    try {
        const NewVoterRoll = await VoterRollModel.submitVoterRoll(req.election.election_id, req.voterRoll,false)
        if (!NewVoterRoll)
            return res.status('400').json({
                error: "Voter Roll not found"
            })
        res.status('200').json(JSON.stringify(NewVoterRoll))
        next()
    } catch (err) {
        console.log(err)
        return res.status('400').json({
            error: "Could not create voter roll"
        })
    }
}

const updateVoterRoll = async (req: any, res: any, next: any) => {
    // Updates single entry of voter roll
    try {
        const voterRollEntry = await VoterRollModel.update(req.voterRollEntry)
        if (!voterRollEntry)
            return res.status('400').json({
                error: "Voter Roll not found"
            })
        req.voterRollEntry = voterRollEntry
        next()
    } catch (err) {
        console.log(err)
        return res.status('400').json({
            error: "Could not update voter roll"
        })
    }
}

const getByVoterID = async (req: any, res: any, next: any) => {

    try {
        const voterRollEntry = await VoterRollModel.getByVoterID(req.election.election_id, req.voter_id)
        if (!voterRollEntry)
            return res.status('400').json({
                error: "Voter Roll not found"
            })
        req.voterRollEntry = voterRollEntry
        next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not find voter roll entry"
        })
    }
}

module.exports = {
    updateVoterRoll,
    getRollsByElectionID,
    addVoterRoll,
    getByVoterID,
}