import React, { useState } from 'react'
import { Box } from "@mui/material"
import { PrimaryButton } from '../../styles';
import useElection from '../../ElectionContextProvider';
import RaceDialog from './RaceDialog';
import RaceForm from './RaceForm';
import { useEditRace } from './useEditRace';

export default function AddRace() {
    const { election } = useElection()

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [activeStep, setActiveStep] = useState(0);
    const resetStep = () => setActiveStep(0);

    const { editedRace, errors, setErrors, applyRaceUpdate, onAddRace } = useEditRace(null, election.races.length)

    const onAdd = async () => {
        const success = await onAddRace()
        if (!success) return
        handleClose()
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row'
        }}>
            <PrimaryButton
                onClick={handleOpen}
                disabled={election.state!=='draft'}>
                Add Race
            </PrimaryButton>
            <RaceDialog
              onSaveRace={onAdd}
              open={open}
              handleClose={handleClose}
              editedRace={editedRace}
              resetStep={resetStep}
            >
                <RaceForm
                    race_index={election.races.length}
                    editedRace={editedRace}
                    errors={errors}
                    setErrors={setErrors}
                    applyRaceUpdate={applyRaceUpdate}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                />
            </RaceDialog>
        </Box>
    )
}
