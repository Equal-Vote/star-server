
import { Election } from '../../../domain_model/Election';
import { ElectionSettings } from '../../../domain_model/ElectionSettings';
import { Race } from '../../../domain_model/Race';
var jwt = require('jsonwebtoken')


module.exports = {
    user1token : jwt.sign({ 
        email: 'Alice@email.com',
        sub: 'Alice1234',
    
     }, "privateKey"),
    
     user2token : jwt.sign({ 
        email: 'Bob@email.com',
        sub: 'Bob2345',
    
     }, "privateKey"),

     user3token : jwt.sign({ 
        email: 'Carl@email.com',
        sub: 'Carl3456',
    
     }, "privateKey"),
    
     Election1 : {
         election_id: 0,
         title: 'Election 1',
         state: 'Draft',
         frontend_url: '',
         owner_id: '0',
         races: [] as Race[],
         settings: {
            voter_roll_type: 'None',
            voter_id_type: 'IP Address'
         } as ElectionSettings
     } as Election,

     IncompleteElection : {
        election_id: 0,
        title: 'Election 1',
        state: 'Draft',
        frontend_url: '',
        owner_id: '0',
    } as Election,
    
    EmailRollElection : {
        election_id: 0,
        title: 'Election 1',
        state: 'Draft',
        frontend_url: '',
        owner_id: '0',
        races: [
            {
                race_id: '0',
                title:'Race 0',
                num_winners: 1,
                voting_method:'STAR',
                candidates:[
                    {
                        candidate_id:'0',
                        candidate_name: 'A',
                    },
                    {
                        candidate_id:'1',
                        candidate_name: 'B',
                    },
                    {
                        candidate_id:'2',
                        candidate_name: 'C',
                    }
                ]
            }
        ] as Race[],
        settings: {
           voter_roll_type: 'Email',
           voter_id_type: 'Email'
        } as ElectionSettings
    } as Election,

    EmailRoll:[
        'Alice@email.com',
        'Bob@email.com'
    ],
    Ballot1: {
        ballot_id: 0,
        election_id: 1,
        status: 'Submitted',
        date_submitted: new Date(),
        votes: [{
            race_id:'0',
            scores: [{
                candidate_id: 'A',
                score: 5,
            },
            {
                candidate_id: 'B',
                score: 0,

            },
            {
                candidate_id: 'C',
                score: 4,
            }
            ]
        }]
    },

    IDRollElection : {
        election_id: 0,
        title: 'Election 1',
        state: 'Draft',
        frontend_url: '',
        owner_id: '0',
        races: [
            {
                race_id: '0',
                title:'Race 0',
                num_winners: 1,
                voting_method:'STAR',
                candidates:[
                    {
                        candidate_id:'0',
                        candidate_name: 'A',
                    },
                    {
                        candidate_id:'1',
                        candidate_name: 'B',
                    },
                    {
                        candidate_id:'2',
                        candidate_name: 'C',
                    }
                ]
            }
        ] as Race[],
        settings: {
           voter_roll_type: 'IDs',
           voter_id_type: 'IDs'
        } as ElectionSettings
    } as Election,

    IDRoll:[
        'AliceID',
        'BobID'
    ],
    Ballot2: {
        ballot_id: 0,
        election_id: 2,
        status: 'Submitted',
        date_submitted: new Date(),
        votes: [{
            race_id:'0',
            scores: [{
                candidate_id: 'A',
                score: 5,
            },
            {
                candidate_id: 'B',
                score: 0,

            },
            {
                candidate_id: 'C',
                score: 4,
            }
            ]
        }]
    }
}