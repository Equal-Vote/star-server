import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Radio, RadioGroup, Select, Step, StepConnector, StepContent, StepLabel, Stepper, TextField, Tooltip, Typography } from "@mui/material";
import { StyledButton, Tip } from "../styles";
import { Dispatch, SetStateAction, createContext, useContext, useRef, useState } from "react";
import { ElectionTitleField } from "./Details/ElectionDetailsForm";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { openFeedback } from "../util";
import { useTranslation } from "react-i18next";

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
    {activeStep < 3 && // hard coding this for now
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

    const [activeStep, setActiveStep] = useState(0);
    const [termType, setTermType] = useState('');
    const [restricted, setRestricted] = useState(undefined);
    const [allOptions, setAllOptions] = useState(false);
    const [electionTitle, setElectionTitle] = useState('');
    const [errors, setErrors] = useState({title: ''});
    const contentRef = useRef(null);
    const onClose = () => {
        setActiveStep(0);
        createElectionContext.setOpen(false);
    };

    // TODO: it would be cool to define a useTranslationExt that did the substitutions for me
    // TODO: automatic tip insertion would also be cool
    const { t:_t } = useTranslation();
    let term = termType == ''? '' : _t(`terms.${termType}.type`);
    // wrap the standard t property so that we can insert the term election vs poll
    const t = key => _t(key)
        .replace('__CAPITALIZED_TERM__', term) 
        .replace('__LOWERCASE_TERM__', term.toLowerCase()); 

    return <Dialog
        open={createElectionContext.open}
        onClose={onClose}
        scroll={'paper'}
        sx={{maxHeight: '90%'}}
        keepMounted
        fullWidth
        maxWidth='sm'
    >
        <DialogTitle> {t('election_creation.dialog_title')} </DialogTitle>
        <DialogContent ref={contentRef}>
            <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                    <StepLabel>{t('election_creation.term_title')} <strong>{term}</strong></StepLabel>
                    <StepContent>
                        <Typography>{t('election_creation.term_question')}
                            <Tip name='polls_vs_elections'/>
                        </Typography>
                        <RadioGroup row>
                            {['poll', 'election'].map( (type, i) => 
                                <FormControlLabel
                                    key={i}
                                    value={t(`terms.${type}.type`)}
                                    control={<Radio/>}
                                    label={t(`terms.${type}.type`)}
                                    onClick={() => setTermType(type)}
                                    checked={termType === type}
                                />
                            )}
                        </RadioGroup>
                        <StepButtons activeStep={activeStep} setActiveStep={setActiveStep} canContinue={termType != ''}/>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>{t('election_creation.title_title')} <strong>{electionTitle}</strong></StepLabel>
                    <StepContent>
                        <Typography>{t('election_creation.title_question')}</Typography>
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
                    <StepLabel>{t('election_creation.restricted_title')} <strong>{restricted !== undefined && t(`general.${restricted? 'yes' : 'no'}`)}</strong></StepLabel>
                    <StepContent>
                        <Typography>
                            {t('election_creation.restricted_question')}
                            <Tip name='restricted'/>
                        </Typography>

                        <RadioGroup row>
                            {[true, false].map( (value, i) => 
                                <FormControlLabel
                                    key={i}
                                    value={value}
                                    control={<Radio/>}
                                    label={t(`general.${value? 'yes' : 'no'}`)}
                                    onClick={() => setRestricted(value)}
                                    checked={restricted === value}
                                />
                            )}
                        </RadioGroup>
                        <StepButtons activeStep={activeStep} setActiveStep={setActiveStep} canContinue={restricted !== undefined}/>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>{t('election_creation.template_title')}</StepLabel>
                    <StepContent>
                        <Typography>
                            {t('election_creation.template_prompt')}
                        </Typography>
                        <Box style={{height: '10px'}}/> {/*hacky padding*/}
                        {(restricted? ['email_list', 'id_list'] : ['demo', 'public', 'unlisted']).map((key, i) => <>
                            <StartingOption
                                title={t(`election_creation.${key}_title`)}
                                description={t(`election_creation.${key}_description`)}
                                key={i}
                            />
                        </>)}

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