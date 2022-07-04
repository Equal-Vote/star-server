import { ElectionRollState } from "../../../domain_model/ElectionRoll";
import ServiceLocator from "../ServiceLocator";

const ElectionRollDB = require('../Models/ElectionRolls')
const EmailService = require('../Services/EmailService')
var ElectionRollModel = new ElectionRollDB(ServiceLocator.postgres());
const { permissions, hasPermission } = require('../auth/permissions')

const getRollsByElectionID = async (req: any, res: any, next: any) => {
    console.log(`-> electionRolls.getRollsByElectionID ${req.election.election_id}`)
    //requires election data in req, adds entire election roll 
    try {
        const electionRoll = await ElectionRollModel.getRollsByElectionID(req.election.election_id)
        if (!electionRoll)
            return res.status('400').json({
                error: "Election roll not found"
            })
        console.log(`Getting Election: ${req.params.id}`)
        console.log(electionRoll)
        req.electionRoll = electionRoll
        return next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve election roll"
        })
    }
}

const returnRolls = async (req: any, res: any, next: any) => {
    console.log(`-> electionRolls.returnRolls ${req.params.id}`)
    res.json({ election: req.election, electionRoll: req.electionRoll })
}

const addElectionRoll = async (req: any, res: any, next: any) => {
    console.log(`-> electionRolls.addElectionRoll ${req.election.election_id}`)

    try {
        // console.log(req)
        
        const history = [{
            action_type: 'added',
            actor: req.user.email,
            timestamp: Date.now(),
        }]
        const NewElectionRoll = await ElectionRollModel.submitElectionRoll(req.election.election_id, req.body.VoterIDList, false, ElectionRollState.approved, history)
        if (!NewElectionRoll)
            return res.status('400').json({
                error: "Voter Roll not found"
            })
        res.status('200').json(JSON.stringify({ election: req.election, NewElectionRoll }))
        return next()
    } catch (err) {
        console.log(err)
        return res.status('400').json({
            error: req.user
        })
    }
}

const editElectionRoll = async (req: any, res: any, next: any) => {
    console.log(`-> electionRolls.editElectionRoll ${req.election.election_id}`)

    try {
        if (req.body.electionRollEntry.history == null){
            req.body.electionRollEntry.history = [];
        }
        req.body.electionRollEntry.history.push([{
            action_type: 'edited',
            actor: req.user.email,
            timestamp: Date.now(),
        }])
        const electionRollEntry = await ElectionRollModel.update(req.body.electionRollEntry)
        if (!electionRollEntry)
            return res.status('400').json({
                error: "Voter Roll not found"
            })
        req.electionRollEntry = electionRollEntry
        console.log('Voter Roll Updated')
        res.status('200').json()
    } catch (err) {
        console.log(err)
        return res.status('400').json({
            error: "Could not edit election roll"
        })
    }
}

const changeElectionRollState = async (req: any, res: any, next: any) => {
    console.log(`-> electionRolls.changeElectionRollState ${req.election.election_id}`)

    try {
        req.electionRollEntry = await ElectionRollModel.getByVoterID(req.election.election_id, req.body.electionRollEntry.voter_id)
        const newState = req.body.electionRollEntry.state;
        // Logic to control election roll state change permissions is more complex so handled here
        // Each state has valid transitions to other states and permissions associated with them
        if (req.electionRollEntry.state === ElectionRollState.registered) {
            if (!((newState === ElectionRollState.approved && hasPermission(req.user_auth.roles, permissions.canApproveElectionRoll)) ||
                (newState === ElectionRollState.flagged && hasPermission(req.user_auth.roles, permissions.canFlagElectionRoll)))) {
                return res.status('401').json({
                    error: "Does not have permission"
                })
            }
        } else if (req.electionRollEntry.state === ElectionRollState.approved) {
            if (!(newState === ElectionRollState.flagged && hasPermission(req.user_auth.roles, permissions.canFlagElectionRoll))) {
                return res.status('401').json({
                    error: "Does not have permission"
                })
            }
        } else if (req.electionRollEntry.state === ElectionRollState.flagged) {
            if (!((newState === ElectionRollState.approved && hasPermission(req.user_auth.roles, permissions.canUnflagElectionRoll)) ||
                (newState === ElectionRollState.invalid && hasPermission(req.user_auth.roles, permissions.canInvalidateElectionRoll)))) {
                return res.status('401').json({
                    error: "Does not have permission"
                })
            }
        } else if (req.electionRollEntry.state === ElectionRollState.invalid) {
            if (!(newState === ElectionRollState.flagged && hasPermission(req.user_auth.roles, permissions.canInvalidateElectionRoll))) {
                return res.status('401').json({
                    error: "Does not have permission"
                })
            }
        } else {
            return res.status('401').json({
                error: "Does not have permission"
            })
        }

        req.electionRollEntry.state = newState;
        if (req.electionRollEntry.history == null){
            req.electionRollEntry.history = [];
        }
        req.electionRollEntry.history.push([{
            action_type: newState,
            actor: req.user.email,
            timestamp: Date.now(),
        }])
        const updatedEntry = await ElectionRollModel.update(req.electionRollEntry)
        if (!updatedEntry)
            return res.status('400').json({
                error: "Voter Roll not found"
            })
        req.electionRollEntry = updatedEntry
        res.status('200').json()
    } catch (err) {
        console.log(err)
        return res.status('400').json({
            error: "Could not change election roll state"
        })
    }
}

const updateElectionRoll = async (req: any, res: any, next: any) => {
    console.log(`-> electionRolls.updateElectionRoll`)
    // Updates single entry of election roll
    if (req.election.settings.voter_id_type === 'None') {
        return next();
    }
    try {

        const electionRollEntry = await ElectionRollModel.update(req.electionRollEntry)
        if (!electionRollEntry)
            return res.status('400').json({
                error: "Voter Roll not found"
            })
        req.electionRollEntry = electionRollEntry
        console.log('Voter Roll Updated')
        return next();
    } catch (err) {
        console.log(err)
        return res.status('400').json({
            error: "Could not update election roll"
        })
    }
}

const getByVoterID = async (req: any, res: any, next: any) => {
    console.log(`-> electionRolls.getByVoterID ${req.election.election_id} ${req.params.voter_id}`)

    try {
        const electionRollEntry = await ElectionRollModel.getByVoterID(req.election.election_id, req.params.voter_id)
        if (!electionRollEntry)
            return res.status('400').json({
                error: "Voter Roll not found"
            })
        res.json({ electionRollEntry: electionRollEntry })
        next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not find election roll entry"
        })
    }
}

const getVoterAuth = async (req: any, res: any, next: any) => {
    console.log(`-> electionRolls.getVoterAuth`)
    // 
    if (req.election.settings.voter_id_type === 'None') {
        req.authorized_voter = true
        req.has_voted = false
        req.electionRollEntry = {}
        return next()
    } else if (req.election.settings.voter_id_type === 'IP Address') {
        console.log(String(req.ip))
        req.voter_id = String(req.ip)
    } else if (req.election.settings.voter_id_type === 'Email') {
        // If user isn't logged in, send response requesting log in
        if (!req.user) {
            return res.json({
                voterAuth: {
                    authorized_voter: false,
                    required: "Log In"
                }
            })
        }
        req.voter_id = req.user.email
    } else if (req.election.settings.voter_id_type === 'IDs') {
        // If voter ID not set, send response requesting voter ID to be entered
        if (!req.cookies.voter_id) {
            return res.json({
                voterAuth: {
                    authorized_voter: false,
                    required: "Voter ID"
                }
            })
        }
        req.voter_id = req.cookies.voter_id
    }
    try {
        const electionRollEntry = await ElectionRollModel.getByVoterID(req.election.election_id, req.voter_id)
        if (!electionRollEntry)
            return res.status('400').json({
                error: "Voter Roll not found"
            })
        req.electionRollEntry = electionRollEntry
    } catch (err) {
        return res.status('400').json({
            error: "Could not find election roll entry"
        })
    }
    if (req.election.settings.election_roll_type === 'None') {
        req.authorized_voter = true;
        if (req.electionRollEntry.length == 0) {
            //Adds voter to roll if they aren't currently
            const history = [{
                action_type: ElectionRollState.approved,
                actor: req.user?.email || req.voter_id,
                timestamp: Date.now(),
            }]
            const NewElectionRoll = await ElectionRollModel.submitElectionRoll(req.election.election_id, [req.voter_id], false,ElectionRollState.approved,history)
            if (!NewElectionRoll)
                return res.status('400').json({
                    error: "Voter Roll not found"
                })
            req.electionRollEntry = NewElectionRoll
            req.has_voted = false
            return next()
        } else {
            req.has_voted = req.electionRollEntry.submitted
            return next()
        }
    } else if (req.election.settings.election_roll_type === 'Email' || req.election.settings.election_roll_type === 'IDs') {
        if (req.electionRollEntry.length == 0) {
            req.authorized_voter = false;
            req.has_voted = false
            return next()
        } else {
            req.authorized_voter = true
            req.has_voted = req.electionRollEntry.submitted
            return next()
        }
    }
}

const sendInvitations = async (req: any, res: any, next: any) => {
    //requires election data in req, adds entire election roll 
    if (req.election.settings.election_roll_type === 'Email') {
        console.log(`-> electionRolls.sendInvitations ${req.election.election_id}`)
        try {
            const url = req.protocol + '://' + req.get('host')
            EmailService.sendInvitations(req.election, req.electionRoll, url)
        } catch (err) {
            return res.status('400').json({
                error: "Could not send invitations"
            })
        }
    }
    return res.json({ election: req.election })
}

module.exports = {
    updateElectionRoll,
    getRollsByElectionID,
    returnRolls,
    addElectionRoll,
    getByVoterID,
    getVoterAuth,
    editElectionRoll,
    sendInvitations,
    changeElectionRollState
}
