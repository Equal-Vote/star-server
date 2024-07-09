import { Box, Grid, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

import { useGetGlobalElectionStats } from '~/hooks/useAPI';
import SlotCounter from 'react-slot-counter';
import { useSubstitutedTranslation } from '../util';

interface FeaturePanel{
    title: string;
    text: string;
}

export default () => {
    let {t} = useSubstitutedTranslation('election');

    const { data, isPending, error, makeRequest: fetchData } = useGetGlobalElectionStats();

    const containerRef = useRef(null);

    const [visible, setVisible] = useState(false)

    useEffect(() => {
        fetchData()
        setInterval(fetchData, 5000)
    }, []);

    const observer = new IntersectionObserver((entries) => setVisible(entries[0].isIntersecting))

    useEffect(() => observer.observe(containerRef.current as Element))

    return <Box
        sx={{
            display: 'flex',
            flexDirection: 'row',
            margin: 'auto',
            width: '100%',
            maxWidth: '1300px',
            gap: '10rem',
            justifyContent: 'center',
        }}
        ref={containerRef}
    >
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
        }}>
            <Typography variant='h4' sx={{margin: 0}}><SlotCounter value={visible? data?.elections ?? 0 : 0 }/></Typography>
            <Typography variant='h5' sx={{margin: 0}}>{t('landing_page.election_stats.elections_created')}</Typography>
        </Box>
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
        }}>
            <Typography variant='h4' sx={{margin: 0}}><SlotCounter value={visible? data?.votes ?? 0 : 0 }/></Typography>
            <Typography variant='h5' sx={{margin: 0}}>{t('landing_page.election_stats.votes_cast')}</Typography>
        </Box>
    </Box>
}