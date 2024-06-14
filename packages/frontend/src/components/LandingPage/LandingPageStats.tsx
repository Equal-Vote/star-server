import { Box, Grid, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import FeaturedElection from './FeaturedElection'
import { useTranslation } from 'react-i18next';
import { useGetGlobalElectionStats } from '~/hooks/useAPI';

interface FeaturePanel{
    title: string;
    text: string;
}

export default () => {
    let {t} = useTranslation();

    const { data, isPending, error, makeRequest: fetchData } = useGetGlobalElectionStats();

    useEffect(() => {
        setInterval(fetchData, 5000)
    }, []);

    return <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        margin: 'auto',
        width: '100%',
        maxWidth: '1300px',
        gap: '10rem',
        justifyContent: 'center',
    }}>
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
        }}>
            <Typography variant='h4' sx={{margin: 0}}>{data?.elections ?? 0}</Typography>
            <Typography variant='h5' sx={{margin: 0}}>{t('election_stats.elections_created')}</Typography>
        </Box>
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
        }}>
            <Typography variant='h4' sx={{margin: 0}}>{data?.votes ?? 0}</Typography>
            <Typography variant='h5' sx={{margin: 0}}>{t('election_stats.votes_cast')}</Typography>
        </Box>
    </Box>
}