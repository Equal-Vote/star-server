import React from 'react'
import { IconButton } from "@mui/material"
import useElection from '../../ElectionContextProvider';
import { useEditRace } from './useEditRace';
import { Race as iRace } from '@equal-vote/star-vote-shared/domain_model/Race';
import { ContentCopy } from '@mui/icons-material';

export default function DuplicateRace({race}: {race: iRace}) {
    const { election } = useElection()

    const { onAddRace } = useEditRace(race, election.races.length)

    const onAdd = async () => {
        const success = await onAddRace()
        if (!success) return
    }

    return (
        <IconButton
            aria-label="copy"
            onClick={onAdd}
            disabled={election.state !== 'draft'}>
            <ContentCopy />
        </IconButton>
    )
}
