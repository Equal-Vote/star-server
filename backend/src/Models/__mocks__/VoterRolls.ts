import { Vote } from '../../../../domain_model/Vote';
import { VoterRoll } from '../../../../domain_model/VoterRoll';

class VoerRollDB {

    voterRolls: VoterRoll[] = []
    constructor() {
    }
    submitVoterRoll(election_id: string, voter_ids: string[],submitted:boolean): Promise<boolean>{
        for (var i = 0; i < voter_ids.length; i++){
            this.voterRolls.push({
                voter_roll_id: '0',
                election_id: election_id,
                voter_id: voter_ids[i],
                submitted: submitted,
            })
        }
        return Promise.resolve(true)
    }
    getRollsByElectionID(election_id: string): Promise<VoterRoll[] | null> {
        const voterRolls = this.voterRolls.filter(ballot => ballot.election_id===election_id)
        if (!voterRolls){
            return Promise.resolve(null)
        }
        return Promise.resolve(voterRolls)
    }
    getByVoterID(election_id: string,voter_id:string): Promise<VoterRoll | [] | null> {
        const ballots = this.voterRolls.find(voterRoll => voterRoll.election_id===election_id && voterRoll.voter_id===voter_id)
        if (!ballots){
            return Promise.resolve([])
        }
        return Promise.resolve(ballots)
    }
    update(voter_roll: VoterRoll): Promise<VoterRoll | null> {
        const index = this.voterRolls.findIndex(voterRoll => voterRoll.election_id===voter_roll.election_id && voterRoll.voter_id===voter_roll.voter_id)
        if (!index){
            return Promise.resolve(null)
        }
        this.voterRolls[index] = voter_roll
        return Promise.resolve(voter_roll)
    }
    delete(voter_roll: VoterRoll): Promise<boolean> {
        const ballot = this.voterRolls.find(voterRoll => voterRoll.election_id===voter_roll.election_id && voterRoll.voter_id===voter_roll.voter_id)
        if (!ballot){
            return Promise.resolve(false)
        }
        this.voterRolls = this.voterRolls.filter(voterRoll => voterRoll.election_id!==voter_roll.election_id || voterRoll.voter_id!==voter_roll.voter_id)
        return Promise.resolve(true)
    }
}

module.exports = VoerRollDB