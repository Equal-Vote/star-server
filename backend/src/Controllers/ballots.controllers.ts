const BallotsDB = require('../Models/Ballots')

var BallotModel = new BallotsDB();

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
        return next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve ballots"
        })
    }
}

const submitBallot = async (req: any, res: any, next: any) => {
    if (req.election.state!=='open'){
        console.log("-> Election not open")
        return res.status('400').json({
            error: "Election is not open"
        })
    }
    if (!req.authorized_voter){
        console.log("Voter not authorized")
        return res.status('400').json({
            error: "Voter not authorized"
        })
    }
    if (req.has_voted){
        console.log("Voter already submitted ballot")
        return res.status('400').json({
            error: "Voter already submitted ballot"
        })
    }

    try {
        const Ballot = await BallotModel.submitBallot(req.body.ballot)
        if (!Ballot)
            return res.status('400').json({
                error: "Ballots not found"
            })
        req.electionRollEntry.submitted = true
        return next()

    } catch (err) {
        return res.status('400').json({
            error: (err as any).message
        })
    }
}


module.exports = {
    getBallotsByElectionID,
    submitBallot,
    ballotByID
}