import React, { useEffect, useMemo } from 'react'
import { Election } from "@domain_model/Election"
import useAuthSession from '../AuthSessionContextProvider';
import ElectionsTable from './ElectionsTable';
import { useGetElections } from 'src/hooks/useAPI';

export default () => {
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
        if(data && data.elections_as_official){
            return data.elections_as_official.map(election => ({
               ...election,
               roles: getRoles(election)
            }));
        }else{
            return [];
        }
    }, [data]);
            
    return <ElectionsTable
        title='Elections You Manage'
        headKeys={['title', 'roles', 'state', 'start_time', 'end_time', 'description']}
        isPending={isPending}
        electionData={managedElectionsData}
    />
}
