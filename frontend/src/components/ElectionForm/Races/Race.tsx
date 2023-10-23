import React from 'react'
import { useState } from "react"
import Typography from '@mui/material/Typography';
import { Box, Paper } from "@mui/material"
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RaceDialog from './RaceDialog';
import { useEditRace } from './useEditRace';
import RaceForm from './RaceForm';

export default function Race({ race, race_index }) {

    const { editedRace, errors, setErrors, applyRaceUpdate, onSaveRace, onDeleteRace } = useEditRace(race, race_index)

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const onSave = async () => {
        const success = await onSaveRace()
        if (!success) return
        handleClose()
    }

    return (
        <Paper elevation={4} sx={{ width: '100%' }}>
            <Box
                sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 10 }}
                alignItems={'center'}
            >
                <Box sx={{ width: '100%', pl: 2 }}>
                    <Typography variant="h4" component="h4">{race.title}</Typography>
                </Box>
                <Box sx={{ flexShrink: 1, p: 1 }}>
                    <IconButton
                        aria-label="edit"
                        onClick={handleOpen}>
                        <EditIcon />
                    </IconButton>
                </Box>
                <Box sx={{ flexShrink: 1, p: 1 }}>

                    <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={onDeleteRace}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </Box>
            <RaceDialog onSaveRace={onSave} open={open} handleClose={handleClose} >
                <RaceForm
                    race_index={race_index}
                    editedRace={editedRace}
                    errors={errors}
                    setErrors={setErrors}
                    applyRaceUpdate={applyRaceUpdate}
                />
            </RaceDialog>
        </Paper >
    )
}