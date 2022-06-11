import { Election } from '../../../../domain_model/Election';

class ElectionsDB {

    elections: Election[] = [];

    constructor() {
    }

    createElection(election: Election): Promise<Election>{
        if (this.elections.length>0){
            election.election_id = this.elections[this.elections.length-1].election_id+1;
        } else {
            election.election_id = 0
        }
        this.elections.push(election)
        return Promise.resolve(election)
    }
    
    updateElection(election: Election): Promise<Election | null> {
        if(election.election_id >= this.elections.length){
            return Promise.resolve(null);
        }

        this.elections[election.election_id] = election;

        return Promise.resolve(election);
    }

    getElections(filter: string): Promise<Election[] | null> {
        var elections = [...this.elections]
        if(filter != ""){
            var filters = filter.split(',');
            
            for(var i = 0; i < filters.length; i++){
                var [key, value] = filters[i].split(':');
                elections = elections.filter(election => (election as any)[key]===String(value))
            }
        }
        if (!elections){
            return Promise.resolve(null)
        }
        return Promise.resolve(elections)
    }

    getElectionByID(election_id: number): Promise<Election | null>{
        const election = this.elections.find(elections => elections.election_id===election_id)
        if (!election){
            return Promise.resolve(null)
        }
        return Promise.resolve(election)
    }

    delete(election_id: number): Promise<Election | null> {
        const election = this.elections.find(ballot => ballot.election_id===election_id)
        if (!election){
            return Promise.resolve(null)
        }
        this.elections = this.elections.filter(election => election.election_id!=election_id)
        return Promise.resolve(election)
    }
}

module.exports = ElectionsDB