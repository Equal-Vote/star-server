import React, { useEffect, useMemo } from 'react'
import { useGetElections } from "../../hooks/useAPI";
import { useNavigate } from 'react-router';
import EnhancedTable from '../EnhancedTable';
import { Box, Container, Link, Paper, Typography } from '@mui/material';
import useFeatureFlags from '../FeatureFlagContextProvider';

export default () => {
    const flags = useFeatureFlags();
    const navigate = useNavigate();

    const { data, isPending, error, makeRequest: fetchElections } = useGetElections();

    useEffect(() => {fetchElections()}, []);

    let openElectionsData = useMemo(
        () => data?.open_elections ? [...data.open_elections] : [],
        [data]
    );

    return <Container>
        <Typography component='p' sx={{textAlign: 'center'}}>
            For browsing the archive of elections for public office, <Link href="/PublicArchive">checkout the public archive!</Link>
        </Typography>
        <EnhancedTable
            title='Open Online Elections'
            headKeys={[ 'title', 'update_date', 'start_time', 'end_time', 'description']}
            data={openElectionsData}
            isPending={isPending}
            pendingMessage='Loading Elections...'
            handleOnClick={(election) => navigate(`/${String(election.raw.election_id)}`)}
            defaultSortBy='update_date'
            emptyContent='No Election Invitations'
        />
    </Container>
}
