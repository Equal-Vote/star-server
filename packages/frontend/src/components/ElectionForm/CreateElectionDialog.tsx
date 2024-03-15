import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Radio, RadioGroup, Select, Step, StepConnector, StepContent, StepLabel, Stepper, TextField, Tooltip, Typography } from "@mui/material";
import { StyledButton, Tip } from "../styles";
import { Dispatch, SetStateAction, createContext, useContext, useRef, useState } from "react";
import { ElectionTitleField } from "./Details/ElectionDetailsForm";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { openFeedback } from "../util";

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

const StartingOption = ({title, description}) => <>
    <Button color='inherit' fullWidth className='startingOption' sx={{justifyContent: 'flex-start', textTransform: 'inherit'}}>
        <Box sx={{width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left'}}>
                <Typography variant="body1">{title}</Typography>
                <Typography color='gray' variant="body2">{description.split('. ').map(sentence => <>{`${sentence}.`}<br/></>)}</Typography>
            </Box>
            <ArrowForwardIosIcon className="startingOptionArrow" sx={{transition: 'padding-left .2s'}}/>
        </Box>
    </Button>
    <Divider/>
</>

export default () => {
    const createElectionContext = useContext(CreateElectionContext);

    const [activeStep, setActiveStep] = useState(2);
    const [electionTerm, setElectionTerm] = useState('');
    const [allOptions, setAllOptions] = useState(false);
    const [electionTitle, setElectionTitle] = useState('');
    const [errors, setErrors] = useState({title: ''});
    const contentRef = useRef(null);
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
        maxWidth='sm'
    >
        <DialogTitle> Create an Election or Poll </DialogTitle>
        <DialogContent ref={contentRef}>
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
                        <StartingOption title={`Demo ${electionTerm}`} description='Unlimited votes per device. Great for demonstrations where multiple people are using the same device'/>
                        <StartingOption title={`Public ${electionTerm}`} description={`1 person, 1 vote. ${electionTerm} will be open to anyone via the public polls & elections page`}/>
                        <StartingOption title={`Unlisted ${electionTerm}`} description={`1 person, 1 vote. ${electionTerm} will be open to anyone via the public elections page`}/>
                        <StartingOption title={`Email List`} description={`Provide a list of emails for your voters. Personal links will be sent to each of these voters once the election starts`}/>

                        <Button
                            sx={{ width: '100%', ml: -1, display: 'flex', justifyContent: 'left', alignItems: 'center' }}
                            onClick={() => setAllOptions(all_options => {
                                if(!all_options){ // !all_options means we're about to enable all options
                                    setTimeout(() => {
                                        contentRef.current.scrollTo({
                                            left: 0,
                                            top: contentRef.current.scrollHeight,
                                            behavior: 'smooth'
                                        })
                                    }, 100);
                                }
                                return !all_options;
                            }) }
                        >
                            {allOptions? <ExpandLess /> : <ExpandMore /> }
                            <Typography>More Options</Typography>
                        </Button>

                        {allOptions && <>
                            <StartingOption title={`Voter Id List`} description={`Distribute unique ids to your voters. Voters can then access a shared link and then authenticate themselves using their id`}/>
                            <StartingOption title={`Login Required`} description={`${electionTerm} is open to everyone, but they're required to make an account with their email. This helps reduce spam`}/>
                            <Box display='flex' flexDirection='row' gap={2} alignItems='center'
                                sx={{pt: '6px', pb: '6px', pl: '8px', pr: '8px'}}> {/*Matching the button padding*/}
                                <Typography>Don't see what you're looking for? </Typography>
                                <Button variant='outlined' onClick={openFeedback}>Send us feedback</Button>
                            </Box>
                            <Divider/>
                        </>}
                        <Box sx={{height: 20}}/> {/*Hacky spacingj*/}
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