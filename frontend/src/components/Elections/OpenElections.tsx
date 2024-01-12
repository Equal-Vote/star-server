import React, { useEffect, useMemo } from 'react'
import { useGetElections } from "../../hooks/useAPI";
import ElectionsTable from './ElectionsTable';

export default () => {

    const { data, isPending, error, makeRequest: fetchElections } = useGetElections();

    useEffect(() => {fetchElections()}, []);

    let openElectionsData = useMemo(
        () => data?.open_elections ? [...data.open_elections] : [],
        [data]
    );
            
    return <ElectionsTable
        title='Open Elections'
        headKeys={['title', 'start_time', 'end_time', 'description']}
        isPending={isPending}
        electionData={openElectionsData}
    />
}
