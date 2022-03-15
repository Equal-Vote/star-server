
import { Election } from '../../../domain_model/Election';
import { ElectionSettings } from '../../../domain_model/ElectionSettings';
import { Race } from '../../../domain_model/Race';
var jwt = require('jsonwebtoken')


module.exports = {
    user1token : jwt.sign({ 
        email: 'Alice@email.com'
    
     }, "privateKey"),
    
     user2token : jwt.sign({ 
        email: 'Bob@email.com'
    
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
     } as Election



}