import { Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Radio, RadioGroup, Select, Step, StepConnector, StepContent, StepLabel, Stepper, TextField, Tooltip, Typography } from "@mui/material";
import { StyledButton } from "../styles";
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ElectionTitleField } from "./Details/ElectionDetailsForm";


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

const StepButtons = ({activeStep, setActiveStep, canContinue}) => <>
    {activeStep < 2 && // hard coding this for now
        <StyledButton
            fullWidth={false}
            variant="contained"
            disabled={!canContinue}
            onClick={() => setActiveStep(i => i+1)}
            sx={{ mt: 1, mr: 1 }}
        >
            Continue
        </StyledButton>
    }
    {activeStep > 0 &&
        <StyledButton
            fullWidth={false}
            variant="text"
            onClick={() => setActiveStep(i => i-1)}
            sx={{ mt: 1, mr: 1 }}
        >
            Back
        </StyledButton>
    }
</>

export default () => {
    const createElectionContext = useContext(CreateElectionContext);

    const [activeStep, setActiveStep] = useState(0);
    const [electionTerm, setElectionTerm] = useState('');
    const [electionTitle, setElectionTitle] = useState('');
    const [errors, setErrors] = useState({title: ''});
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
        <DialogTitle> Create an Election or Poll </DialogTitle>
        <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                    <StepLabel>Poll or Election? <strong>{electionTerm}</strong></StepLabel>
                    <StepContent>
                        <Typography>Which term best describes your situation?
                            <Tooltip
                                title="There's no functional difference between polls and elections. This only impacts which terminology is shown to you and your voters">
                                <IconButton>
                                    <InfoOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <RadioGroup row>
                            <FormControlLabel value='Poll' control={<Radio/>} label='Poll' onClick={() => setElectionTerm('Poll')}/>
                            <FormControlLabel value='Election' control={<Radio/>} label='Election' onClick={() => setElectionTerm('Election')}/>
                        </RadioGroup>
                        <StepButtons activeStep={activeStep} setActiveStep={setActiveStep} canContinue={electionTerm != ''}/>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>Title? <strong>{electionTitle}</strong></StepLabel>
                    <StepContent>
                        <Typography>What's the title for your {electionTerm.toLowerCase()}?</Typography>
                        <ElectionTitleField
                            value={electionTitle}
                            onUpdateValue={
                                (value) => setElectionTitle(value)
                            }
                            errors={errors}
                            setErrors={setErrors}
                            showLabel={false}
                        />
                        <StepButtons activeStep={activeStep} setActiveStep={setActiveStep} canContinue={electionTitle != '' && errors.title == ''}/>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>Choose starting point</StepLabel>
                    <StepContent>
                        <StepButtons activeStep={activeStep} setActiveStep={setActiveStep} canContinue={electionTitle != '' && errors.title == ''}/>
                    </StepContent>
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