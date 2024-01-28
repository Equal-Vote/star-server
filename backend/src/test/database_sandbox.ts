require('dotenv').config()

import servicelocator from '../ServiceLocator'
import { Election } from '../../../domain_model/Election'

const elections: Election[] = []

for (let i = 0; i++; i<10000) {
    elections.push({
        election_id: i.toString(),
        title: i.toString(),
        frontend_url: '',
        races: [],
        owner_id: i.toString(),
        create_date: i.toString(),
        state: 'draft',
        settings: {
            voter_access: 'open',
            voter_authentication: {
                ip_address: true,
            }
        }
    })
}

async function  AddElections() {
    return await servicelocator.database().insertInto('electionDB').values(elections).execute()
}

AddElections()