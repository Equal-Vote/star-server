import { Election } from '../../../../domain_model/Election';
import { ILoggingContext } from '../../Services/Logging/ILogger';
import Logger from '../../Services/Logging/Logger';

export default class ElectionsDB {

    elections: Election[] = [];

    constructor() {
    }

    createElection(election: Election, ctx:ILoggingContext): Promise<Election>{
        Logger.debug(ctx, "Election Mock Creates Election");
        if (this.elections.length>0){
            election.election_id = this.elections[this.elections.length-1].election_id+1;
        } else {
            election.election_id = 0
        }
        this.elections.push(election)
        return Promise.resolve(election)
    }
    
    updateElection(election: Election, ctx:ILoggingContext): Promise<Election | null> {
        if(election.election_id >= this.elections.length){
            return Promise.resolve(null);
        }
        this.elections[election.election_id] = election;
        return Promise.resolve(election);
    }

    getElections(filter: string, ctx:ILoggingContext): Promise<Election[] | null> {
        var elections = [...this.elections]
        if(filter != ""){
            var filters = filter.split(',');
            
            for(var i = 0; i < filters.length; i++){
                var [key, value] = filters[i].split(':');
                elections = elections.filter(election => (election as any)[key]==String(value))
            }
        }
        if (!elections){
            return Promise.resolve(null)
        }
        return Promise.resolve(elections)
    }

    getElectionByID(election_id: number, ctx:ILoggingContext): Promise<Election | null>{
        Logger.debug(ctx, `Mock Election DB getElection ${election_id}, with data = `);
        const election = this.elections.find(election => {
            return election.election_id==election_id;
        });
        if (!election){
            Logger.info(ctx, `Mock DB could not find election ${election_id}`);
            Logger.debug(ctx, JSON.stringify(this.elections));
            return Promise.resolve(null)
        }
        return Promise.resolve(election)
    }

    delete(election_id: number, ctx:ILoggingContext): Promise<Election | null> {
        const election = this.elections.find(ballot => ballot.election_id==election_id)
        if (!election){
            return Promise.resolve(null)
        }
        this.elections = this.elections.filter(election => election.election_id!=election_id)
        return Promise.resolve(election)
    }
}