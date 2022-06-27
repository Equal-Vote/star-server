import { Vote } from '../../../../domain_model/Vote';
import { ElectionRoll, ElectionRollAction } from '../../../../domain_model/ElectionRoll';

class ElectionRollDB {

    electionRolls: ElectionRoll[] = []
    constructor() {
    }
    submitElectionRoll(election_id: string, voter_ids: string[],submitted:boolean,state: string, history: ElectionRollAction): Promise<boolean>{
        for (var i = 0; i < voter_ids.length; i++){
            this.electionRolls.push({
                election_roll_id: '0',
                election_id: election_id,
                voter_id: voter_ids[i],
                submitted: submitted,
                state: state,
                history: [history]
            })
        }
        return Promise.resolve(true)
    }
    getRollsByElectionID(election_id: string): Promise<ElectionRoll[] | null> {
        const electionRolls = this.electionRolls.filter(ballot => ballot.election_id===election_id)
        if (!electionRolls){
            return Promise.resolve(null)
        }
        return Promise.resolve(electionRolls)
    }
    getByVoterID(election_id: string,voter_id:string): Promise<ElectionRoll | [] | null> {
        const ballots = this.electionRolls.find(electionRoll => electionRoll.election_id===election_id && electionRoll.voter_id===voter_id)
        if (!ballots){
            return Promise.resolve([])
        }
        return Promise.resolve(ballots)
    }
    update(voter_roll: ElectionRoll): Promise<ElectionRoll | null> {
        const index = this.electionRolls.findIndex(electionRoll => electionRoll.election_id===voter_roll.election_id && electionRoll.voter_id===voter_roll.voter_id)
        if (!index){
            return Promise.resolve(null)
        }
        this.electionRolls[index] = voter_roll
        return Promise.resolve(voter_roll)
    }
    delete(voter_roll: ElectionRoll): Promise<boolean> {
        const ballot = this.electionRolls.find(electionRoll => electionRoll.election_id===voter_roll.election_id && electionRoll.voter_id===voter_roll.voter_id)
        if (!ballot){
            return Promise.resolve(false)
        }
        this.electionRolls = this.electionRolls.filter(electionRoll => electionRoll.election_id!==voter_roll.election_id || electionRoll.voter_id!==voter_roll.voter_id)
        return Promise.resolve(true)
    }
}

module.exports = ElectionRollDB