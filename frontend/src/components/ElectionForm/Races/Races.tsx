import React from 'react'
import Typography from '@mui/material/Typography';
import { Stack } from "@mui/material"
import useElection from '../../ElectionContextProvider';
import Race from './Race';
import AddRace from './AddRace';

export default function Races() {
    const { election, refreshElection, permissions, updateElection } = useElection()

    return (
        <Stack spacing={2}>
            <Typography gutterBottom variant="h4" component="h4">Races</Typography>

            {election.races?.map((race, race_index) => (
                <Race race={race} race_index={race_index} />
            ))
            }
            <AddRace/>
        </Stack >
    )
}
