import React, { useEffect, useMemo } from 'react'
import { useGetElections } from "../../hooks/useAPI";
import { useNavigate } from 'react-router';
import EnhancedTable from '../EnhancedTable';
import { Box, Container, Link, Paper, Typography } from '@mui/material';
import useFeatureFlags from '../FeatureFlagContextProvider';

export default () => {
    const navigate = useNavigate();

    const { data, isPending, error, makeRequest: fetchElections } = useGetElections();

    useEffect(() => {fetchElections()}, []);

    let publicArchiveData = useMemo(
        () =>  [...data?.public_archive_elections ?? [] ],
        [data]
    );

    return <Container>
        <EnhancedTable
            title='Elections for Public Office'
            headKeys={[ 'title', 'update_date', 'description']}
            data={publicArchiveData}
            isPending={isPending}
            pendingMessage='Loading Elections...'
            handleOnClick={(election) => navigate(`/${String(election.raw.election_id)}/results`)}
            defaultSortBy='update_date'
            emptyContent='No Election Invitations'
        />
    </Container>
}
