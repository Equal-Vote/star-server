import { ElectionRoll, ElectionRollAction, ElectionRollState } from '../../../../domain_model/ElectionRoll';
import { ILoggingContext } from '../../Services/Logging/ILogger';
import Logger from '../../Services/Logging/Logger';

export default class ElectionRollDB {

    electionRolls: ElectionRoll[] = []
    nextId = 0;

    constructor() {
    }

    submitElectionRoll(electionRolls: ElectionRoll[], ctx:ILoggingContext): Promise<boolean>{
        this.electionRolls = this.electionRolls.concat(electionRolls)
        return Promise.resolve(true)
    }

    getRollsByElectionID(election_id: string, ctx:ILoggingContext): Promise<ElectionRoll[] | null> {
        const electionRolls = this.electionRolls.filter(roll => roll.election_id===election_id)
        if (!electionRolls){
            return Promise.resolve(null)
        }
        const res:ElectionRoll[] = JSON.parse(JSON.stringify(electionRolls));
        return Promise.resolve(res);
    }

    getByVoterID(election_id: string,voter_id:string, ctx:ILoggingContext): Promise<ElectionRoll | null> {
        Logger.debug(ctx, `MockElectionRolls getByVoterID ${election_id}, voter:${voter_id}`);
        const roll = this.electionRolls.find(electionRoll => electionRoll.election_id==election_id && electionRoll.voter_id==voter_id)
        if (!roll){
            Logger.debug(ctx, "Mock ElectionRoll DB could not match election and voter. Current data:\n"+JSON.stringify(this.electionRolls));
            return Promise.resolve(null)
        }
        const res:ElectionRoll = JSON.parse(JSON.stringify(roll));
        return Promise.resolve(res)
    }

    update(voter_roll: ElectionRoll, ctx:ILoggingContext): Promise<ElectionRoll | null> {
        const index = this.electionRolls.findIndex(electionRoll => {
            var electionMatch = electionRoll.election_id===voter_roll.election_id;
            var voterMatch = electionRoll.voter_id===voter_roll.voter_id;
            return electionMatch && voterMatch
        });
        if (index < 0){
            return Promise.resolve(null)
        }
        var copy = JSON.parse(JSON.stringify(voter_roll));
        this.electionRolls[index] = copy;
        var res = JSON.parse(JSON.stringify(copy));
        return Promise.resolve(res);
    }

    delete(voter_roll: ElectionRoll, ctx:ILoggingContext): Promise<boolean> {
        const ballot = this.electionRolls.find(electionRoll => electionRoll.election_id===voter_roll.election_id && electionRoll.voter_id===voter_roll.voter_id)
        if (!ballot){
            return Promise.resolve(false)
        }
        this.electionRolls = this.electionRolls.filter(electionRoll => electionRoll.election_id!==voter_roll.election_id || electionRoll.voter_id!==voter_roll.voter_id)
        return Promise.resolve(true)
    }
}