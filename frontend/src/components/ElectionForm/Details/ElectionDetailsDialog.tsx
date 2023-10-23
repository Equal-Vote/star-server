import React, { useContext } from 'react'
import Grid from "@mui/material/Grid";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Typography } from "@mui/material"
import { StyledButton } from '../../styles';

import useElection from '../../ElectionContextProvider';
import { formatDate } from '../../util';
import EditIcon from '@mui/icons-material/Edit';
import ElectionDetailsForm from './ElectionDetailsForm';
import { useEditElectionDetails } from './useEditElectionDetails';

export default function ElectionDetails3() {
    const { editedElection, applyUpdate, onSave, errors, setErrors } = useEditElectionDetails()
    const { election } = useElection()

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSave = async () => {
        const success = await onSave()
        if (success) handleClose()
    }

    return (
        <Paper elevation={3}>
            <Grid container
                sx={{
                    m: 0,
                    p: 1,
                }}
            >
                <Grid xs={12}>
                    <Typography gutterBottom variant="h4" component="h4">
                        Election Title: {election.title}
                    </Typography>
                </Grid>
                <Grid xs={12}>
                    <Typography gutterBottom component="p">
                        Description: {election.description}
                    </Typography>
                </Grid>
                <Grid xs={12}>
                    <Typography gutterBottom component="p">
                        Start Time: {election.start_time ? formatDate(election.start_time, election.settings.time_zone) : 'none'}
                    </Typography>
                </Grid>
                <Grid xs={12}>
                    <Typography gutterBottom component="p">
                        End Time: {election.end_time ? formatDate(election.end_time, election.settings.time_zone) : 'none'}
                    </Typography>
                </Grid>
                <Grid item xs={11}></Grid>
                <Grid item xs={1} sx={{ m: 0, p: 1 }}>
                    <Box sx={{}}>
                        <IconButton
                            aria-label="edit"
                            onClick={handleOpen}>
                            <EditIcon />
                        </IconButton>
                    </Box>
                </Grid>
                <Dialog
                    open={open}
                    onClose={handleClose}
                >
                    <DialogTitle> Edit Election Details</DialogTitle>
                    <DialogContent>
                        <ElectionDetailsForm
                            editedElection={editedElection}
                            applyUpdate={applyUpdate}
                            errors={errors}
                            setErrors={setErrors}
                        />
                    </DialogContent>
                    <DialogActions>
                        <StyledButton
                            type='button'
                            variant="contained"
                            width="100%"
                            fullWidth={false}
                            onClick={handleClose}>
                            Cancel
                        </StyledButton>
                        <StyledButton
                            type='button'
                            variant="contained"
                            fullWidth={false}
                            onClick={() => handleSave()}>
                            Save
                        </StyledButton>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Paper>

    )
}