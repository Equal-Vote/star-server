import React, { useEffect, useMemo } from 'react'
import { Election } from "@equal-vote/star-vote-shared/domain_model/Election"
import useAuthSession from '../AuthSessionContextProvider';
import { useGetElections } from '../../hooks/useAPI';
import { useNavigate } from 'react-router';
import EnhancedTable from '../EnhancedTable';

export default () => {
    const navigate = useNavigate();
    const authSession = useAuthSession()

    const { data, isPending, error, makeRequest: fetchElections } = useGetElections()

    useEffect(() => {
        fetchElections()
    }, [authSession.isLoggedIn()]);

    const userEmail = authSession.getIdField('email')
    const id = authSession.getIdField('sub')
    const getRoles = (election: Election) => {
        let roles = []
        if (election.owner_id === id) {
            roles.push('Owner')
        }
        if (election.admin_ids?.includes(userEmail)) {
            roles.push('Admin')
        }
        if (election.audit_ids?.includes(userEmail)) {
            roles.push('Auditor')
        }
        if (election.credential_ids?.includes(userEmail)) {
            roles.push('Credentialer')
        }
        return roles.join(', ')
    }

    let managedElectionsData = useMemo(() => {
        if(data?.elections_as_official){
            return data.elections_as_official.map(election => ({
               ...election,
               roles: getRoles(election)
            }));
        }else{
            return [];
        }
    }, [data]);
    managedElectionsData  = []
            
    return <EnhancedTable
        title='My Elections & Polls'
        headKeys={['title', 'update_date', 'election_state', 'start_time', 'end_time', 'description']}
        isPending={isPending}
        pendingMessage='Loading Elections...'
        data={managedElectionsData}
        handleOnClick={(row) => navigate(`/${String(row.raw.election_id)}`)}
        defaultSortBy='update_date'
        emptyContent={<>"You don't have any elections yet"<button>Create Election</button></>}
    />
}
