import React from 'react'
import { useState } from "react"
import Typography from '@mui/material/Typography';
import { Box, Paper, Tooltip } from "@mui/material"
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RaceDialog from './RaceDialog';
import { useEditRace } from './useEditRace';
import RaceForm from './RaceForm';
import useElection from '../../ElectionContextProvider';
import { ContentCopy } from '@mui/icons-material';

export default function Race({ race, race_index }) {

    const { election } = useElection()
    const { editedRace, errors, setErrors, applyRaceUpdate, onSaveRace, onDeleteRace, onAddRace, onDuplicateRace } = useEditRace(race, race_index)

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [activeStep, setActiveStep] = useState(0);
    const resetStep = () => setActiveStep(0);

    const onSave = async () => {
        const success = await onSaveRace()
        if (!success) return
        handleClose()
    }

    const onCopy = async () => {
        const success = await onDuplicateRace()
        if (!success) return
    }

    return (
        <Paper elevation={4} sx={{ width: '100%'}}>
            <Box
                sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 10 }}
                alignItems={'center'}
            >
                <Box sx={{ width: '100%', pl: 2 }}>
                    <Typography variant="h5" component="h5">{race.title}</Typography>
                </Box>
                <Box sx={{ flexShrink: 1, p: 1 }}>
                    <Tooltip title='Duplicate'>
                        <IconButton
                            aria-label="copy"
                            onClick={onCopy}
                            disabled={election.state !== 'draft'}>
                            <ContentCopy />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box sx={{ flexShrink: 1, p: 1 }}>
                    <Tooltip title='Edit'>
                        <IconButton
                            aria-label="edit"
                            onClick={handleOpen}>
                            {election.state === 'draft' ? <EditIcon /> : <VisibilityIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box sx={{ flexShrink: 1, p: 1 }}>
                    <Tooltip title='Delete'>
                        <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={onDeleteRace}
                            disabled={election.state !== 'draft'}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

            </Box>
            <RaceDialog
              onSaveRace={onSave}
              open={open}
              handleClose={handleClose}
              editedRace={editedRace}
              resetStep={resetStep}
            >
                <RaceForm
                    race_index={race_index}
                    editedRace={editedRace}
                    errors={errors}
                    setErrors={setErrors}
                    applyRaceUpdate={applyRaceUpdate}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                />
            </RaceDialog>
        </Paper >
    )
}
