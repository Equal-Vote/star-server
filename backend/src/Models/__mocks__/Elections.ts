import { Election } from '../../../../domain_model/Election';
import { ILoggingContext } from '../../Services/Logging/ILogger';
import Logger from '../../Services/Logging/Logger';

export default class ElectionsDB {

    elections: Election[] = [];
    nextId = 0;

    constructor() {
    }

    createElection(election: Election, ctx:ILoggingContext): Promise<Election>{
        Logger.debug(ctx, "Election Mock Creates Election: ", election);
        var copy = JSON.parse(JSON.stringify(election));
        copy.election_id = this.nextId;
        this.nextId++;
        this.elections.push(copy);
        var res = JSON.parse(JSON.stringify(copy));
        return Promise.resolve(res);
    }
    
    updateElection(election: Election, ctx:ILoggingContext): Promise<Election | null> {
        var foundIndex = this.elections.findIndex(dbElection => dbElection.election_id == election.election_id);
        if(foundIndex == -1){
            return Promise.resolve(null);
        }
        var copy = JSON.parse(JSON.stringify(election));
        this.elections[foundIndex] = copy;
        var res = JSON.parse(JSON.stringify(copy));
        return Promise.resolve(res);
    }

    getElections(filter: string, ctx:ILoggingContext): Promise<Election[] | null> {
        var elections:Array<Election> = JSON.parse(JSON.stringify(this.elections));
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
        Logger.debug(ctx, `Mock Election DB getElection ${election_id}`);
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
        const election = this.elections.find(election => election.election_id==election_id)
        if (!election){
            return Promise.resolve(null)
        }
        this.elections = this.elections.filter(election => election.election_id!=election_id)
        return Promise.resolve(election)
    }
}