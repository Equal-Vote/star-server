import { ElectionRoll, ElectionRollAction, ElectionRollState } from '../../../../domain_model/ElectionRoll';

export default class ElectionRollDB {

    electionRolls: ElectionRoll[] = []
    nextId = 0;

    constructor() {
    }

    submitElectionRoll(election_id: string, voter_ids: string[],submitted:boolean,state: ElectionRollState, history: ElectionRollAction): Promise<boolean>{
        console.log("= = = = = \n SUBMIT ELECTION ROLL \n = = = = = ");
        for (var i = 0; i < voter_ids.length; i++){
            this.electionRolls.push({
                election_roll_id: String(this.nextId),
                election_id: election_id,
                voter_id: voter_ids[i],
                submitted: submitted,
                state: state,
                history: [history]
            });
            this.nextId++;
        }
        return Promise.resolve(true)
    }

    getRollsByElectionID(election_id: string): Promise<ElectionRoll[] | null> {
        const electionRolls = this.electionRolls.filter(roll => roll.election_id===election_id)
        if (!electionRolls){
            return Promise.resolve(null)
        }
        const res:ElectionRoll[] = JSON.parse(JSON.stringify(electionRolls));
        return Promise.resolve(res);
    }

    getByVoterID(election_id: string,voter_id:string): Promise<ElectionRoll | null> {
        console.log(`MockElectionRolls getByVoterID ${election_id}, voter:${voter_id}`);
        const roll = this.electionRolls.find(electionRoll => electionRoll.election_id==election_id && electionRoll.voter_id==voter_id)
        if (!roll){
            console.log("Mock ElectionRoll DB could not match election and voter. Current data:\n"+JSON.stringify(this.electionRolls));
            return Promise.resolve(null)
        }
        const res:ElectionRoll = JSON.parse(JSON.stringify(roll));
        return Promise.resolve(res)
    }

    update(voter_roll: ElectionRoll): Promise<ElectionRoll | null> {
        const index = this.electionRolls.findIndex(electionRoll => {
            var electionMatch = electionRoll.election_id===voter_roll.election_id;
            var voterMatch = electionRoll.voter_id===voter_roll.voter_id;
            return electionMatch && voterMatch
        });
        if (index < 0){
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