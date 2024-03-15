import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Radio, RadioGroup, Select, Step, StepConnector, StepContent, StepLabel, Stepper, TextField, Tooltip, Typography } from "@mui/material";
import { StyledButton, Tip } from "../styles";
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";
import { ElectionTitleField } from "./Details/ElectionDetailsForm";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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

const StartingOption = ({title, description, }) => <>
    <Button color='inherit' fullWidth className='startingOption' sx={{justifyContent: 'flex-start'}}>
        <Box sx={{width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant="body2">{title}</Typography>
                <Typography variant="h6">{description}</Typography>
            </Box>
            <ArrowForwardIosIcon className="startingOptionArrow" sx={{transition: 'margin-right .2s'}}/>
        </Box>
    </Button>
    <Divider/>
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
        sx={{maxHeight: '90%'}}
        keepMounted
        fullWidth
    >
        <DialogTitle> Create an Election or Poll </DialogTitle>
        <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                    <StepLabel>Poll or Election? <strong>{electionTerm}</strong></StepLabel>
                    <StepContent>
                        <Typography>Which term best describes your situation?
                            <Tip name='polls_vs_elections'/>
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
                        <StartingOption title='blah' description='asdfqwefasdbasdfwefasdfas'/>
                        <StartingOption title='blah' description='asdfqwefasdbasdfwefasdfas'/>
                        <StartingOption title='blah' description='asdfqwefasdbasdfwefasdfas'/>
                        <StartingOption title='blah' description='asdfqwefasdbasdfwefasdfas'/>
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