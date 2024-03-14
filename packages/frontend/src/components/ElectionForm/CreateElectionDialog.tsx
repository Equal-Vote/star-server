import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, Step, StepConnector, StepContent, StepLabel, Stepper, TextField, Tooltip, Typography } from "@mui/material";
import { StyledButton } from "../styles";
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";


export interface ICreateElectionContext{
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export const CreateElectionContext = createContext<ICreateElectionContext>(null);

export const CreateElectionContextProvider = ({children}) => {
    const [open, setOpen] = useState(false);

    return <CreateElectionContext.Provider
        value={{open, setOpen}}
    >
        {children}
    </CreateElectionContext.Provider>
}

export default () => {
    const createElectionContext = useContext(CreateElectionContext);

    const [activeStep, setActiveStep] = useState(0);
    const [electionTerm, setElectionTerm] = useState('');
    const onClose = () => {
        setActiveStep(0);
        createElectionContext.setOpen(false);
    };

    return <Dialog
        open={createElectionContext.open}
        onClose={onClose}
        scroll={'paper'}
        keepMounted
        sx={{
            width: '100%',
            maxWidth: 800,
            margin: 'auto'
        }}
    >
        <DialogTitle> Create Election/Poll </DialogTitle>
        <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                    <StepLabel>Poll or Election? <bold>{electionTerm}</bold></StepLabel>
                    <StepContent>
                        <Typography>Which term best describes your situation?
                            <Tooltip
                                title="There's no functional difference between Poll & Election. This only impacts which terminology is shown to you and your voters">
                            </ToolTip>
                        </Typography>
                        <Select value='Election'>
                            <MenuItem value='Election'>Election</MenuItem>
                            <MenuItem value='Poll'>Poll</MenuItem>
                        </Select>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>Poll or Election? <strong>{electionTerm}</strong></StepLabel>
                    <StepContent>
                        <Typography>Which term best describes your situation?</Typography>
                        <TextField
                            inputProps={{ pattern: "[a-z]{1,15}" }}
                            required
                            id="election-name"
                            name="name"
                            // TODO: This bolding method only works for the text fields, if we like it we should figure out a way to add it to other fields as well
                            // inputProps={getStyle('title')}
                            label="Election Title"
                            type="text"
                            value={'temp'}
                            sx={{
                                m: 0,
                                p: 0,
                                boxShadow: 2,
                            }}
                            fullWidth
                        />
                        <StyledButton
                            variant="contained"
                            onClick={() => setActiveStep(i => i+1)}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            Continue
                        </StyledButton>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>Starting Point</StepLabel>
                    <StepContent>blah</StepContent>
                </Step>
            </Stepper>
        </DialogContent>
        <DialogActions>
            <StyledButton
                type='button'
                variant="contained"
                width="100%"
                fullWidth={false}
                onClick={onClose}>
                Cancel
            </StyledButton>
        </DialogActions>
    </Dialog>
}