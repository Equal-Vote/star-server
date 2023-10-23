import React, { useState } from 'react'
import { Box } from "@mui/material"
import { StyledButton } from '../../styles';
import useElection from '../../ElectionContextProvider';
import RaceDialog from './RaceDialog';
import RaceForm from './RaceForm';
import { useEditRace } from './useEditRace';

export default function AddRace() {
    const { election } = useElection()

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const { editedRace, errors, setErrors, applyRaceUpdate, onAddRace } = useEditRace(null, election.races.length)

    const onAdd = async () => {
        const success = await onAddRace()
        if (!success) return
        handleClose()
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row-reverse'
        }}>
            <StyledButton
                type='button'
                variant="contained"
                fullWidth={false}
                sx={{ borderRadius: 28, backgroundColor: 'brand.green' }}
                onClick={handleOpen}>
                Add
            </StyledButton>
            <RaceDialog onSaveRace={onAdd} open={open} handleClose={handleClose} >
                <RaceForm
                    race_index={election.races.length}
                    editedRace={editedRace}
                    errors={errors}
                    setErrors={setErrors}
                    applyRaceUpdate={applyRaceUpdate}
                />
            </RaceDialog>
        </Box>
    )
}
