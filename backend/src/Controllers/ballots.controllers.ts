
const BallotsDB = require('../Models/Ballots')

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
var BallotModel = new BallotsDB(pool, "ballotDB");
BallotModel.init();


const ballotByID = async (req: any, res: any, next: any) => {
    try {
        const ballot = await BallotModel.getElectionByID(parseInt(req.params.id))
        if (!ballot)
            return res.status('400').json({
                error: "Ballot not found"
            })

        req.ballot = ballot
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve ballot"
        })
    }
}

const getBallotsByElectionID = async (req: any, res: any, next: any) => {

    try {
        console.log(req.election.election_id)
        const ballots = await BallotModel.getBallotsByElectionID(String(req.election.election_id))
        if (!ballots)
            return res.status('400').json({
                error: "Ballots not found"
            })
        console.log(ballots)
        req.ballots = ballots
        next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve ballots"
        })
    }
}

const submitBallot = async (req: any, res: any, next: any) => {
    try {
        const Ballot = await BallotModel.submitBallot(req.body)
        if (!Ballot)
            return res.status('400').json({
                error: "Ballots not found"
            })
        return res.status('200')

    } catch (err) {
        return res.status('400').json({
            error: "Could not submit ballot"
        })
    }
}

module.exports = {
    getBallotsByElectionID,
    submitBallot,
    ballotByID
}