import React from 'react'

import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { StyledButton } from '../../styles';
import useElection from '../../ElectionContextProvider';


export default function RaceDialog({ onSaveRace, open, handleClose, children, editedRace }) {


    const { election } = useElection()
    const handleSave = () => {
        //delete any blank candidates
        editedRace.candidates = editedRace.candidates.filter(candidate => candidate.candidate_name !== '')
        onSaveRace()
    }

    const onClose = (event, reason) => {
        if (reason && reason == "backdropClick")
            return;
        handleClose();
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            scroll={'paper'}
            keepMounted>
            <DialogTitle> Edit Race </DialogTitle>
            <DialogContent>
                {children}
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
                    onClick={() => handleSave()}
                    disabled={election.state!=='draft'}>
                    Save
                </StyledButton>
            </DialogActions>

        </Dialog>
    )
}