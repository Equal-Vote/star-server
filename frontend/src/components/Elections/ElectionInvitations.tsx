import React, { useEffect } from 'react'
import { useGetElections } from "../../hooks/useAPI";
import ElectionsTable from './ElectionsTable';

export default () => {

    const { data, isPending, error, makeRequest: fetchElections } = useGetElections();

    useEffect(() => {fetchElections()}, []);

    const electionInvitations = React.useMemo(
        () => data?.elections_as_voter ? data.elections_as_voter : [],
        [data],
    );
            
    return <ElectionsTable
        title='Elections You Can Vote In'
        headKeys={['title', 'state', 'start_time', 'end_time', 'description']}
        isPending={isPending}
        electionData={electionInvitations}
    />
}
