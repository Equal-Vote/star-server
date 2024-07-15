import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Radio, RadioGroup, Select, Step, StepConnector, StepContent, StepLabel, Stepper, TextField, Tooltip, Typography } from "@mui/material";
import { StyledButton, Tip } from "../styles";
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useRef, useState } from "react";
import { ElectionTitleField } from "./Details/ElectionDetailsForm";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { openFeedback, useSubstitutedTranslation } from "../util";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { NewElection } from "@equal-vote/star-vote-shared/domain_model/Election";
import { DateTime } from "luxon";
import useAuthSession from "../AuthSessionContextProvider";
import { usePostElection } from "~/hooks/useAPI";
import { TermType } from "@equal-vote/star-vote-shared/domain_model/ElectionSettings";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

/////// PROVIDER SETUP /////
export interface ICreateElectionContext{
    open: boolean
    quickPoll: NewElection
    openDialog: (quickPoll?:NewElection) => void
    closeDialog: () => void
}

export const CreateElectionContext = createContext<ICreateElectionContext>(null);

export const CreateElectionContextProvider = ({children}) => {
    const [open, setOpen] = useState(false);
    const [quickPoll, setQuickPoll] = useState(undefined);

    const openDialog = (quickPoll:NewElection = undefined) =>{
        setQuickPoll(quickPoll);
        setOpen(true);
    }

    const closeDialog = () =>{
        setQuickPoll(undefined);
        setOpen(false);
    }

    return <CreateElectionContext.Provider
        value={{open, quickPoll, openDialog, closeDialog}}
    >
        {children}
    </CreateElectionContext.Provider>
}

/////// DIALOG /////

const defaultElection: NewElection = {
    title: '',
    owner_id: '',
    description: '',
    state: 'draft',
    frontend_url: '',
    races: [],
    settings: {
        voter_authentication: {
            voter_id: false,
            email: false,
            ip_address: false
        },
        ballot_updates: false,
        public_results: true,
        time_zone: DateTime.now().zone.name,
        random_candidate_order: true,
        require_instruction_confirmation: true,
        invitation: undefined,
        // election_term, and voter_access are intentially omitted
        // this let's me start them at undefined for the stepper
    }
}

const templateMappers = {
    'demo': (election:NewElection):NewElection => ({
        ...election,
    }),
    'public': (election:NewElection):NewElection => ({
        ...election,
        is_public: true,
        settings: {
            ...election.settings,
            voter_authentication: {
                ...election.settings.voter_authentication,
                voter_id: true
            },
        }
    }),
    'unlisted': (election:NewElection):NewElection => ({
        ...election,
        is_public: false,
        settings: {
            ...election.settings,
            voter_authentication: {
                ...election.settings.voter_authentication,
                voter_id: true
            },
        }
    }),
    'email_list': (election) => ({
        ...election,
        is_public: false,
        settings: {
            ...election.settings,
            voter_authentication: {
                ...election.settings.voter_authentication,
                email: true
            },
            invitation: true,
            is_public: false
        }
    }),
    'id_list': (election) => ({
        ...election,
        settings: {
            ...election.settings,
            voter_authentication: {
                ...election.settings.voter_authentication,
                voter_id: true
            },
            is_public: false
        }
    }),
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

const StartingOption = ({title, description, onClick}) => <>
    <Button
        color='inherit'
        fullWidth
        className='startingOption'
        sx={{justifyContent: 'flex-start', textTransform: 'inherit'}}
        onClick={onClick} 
    >
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

    const onClose = () => {
        setActiveStep(0);
        createElectionContext.closeDialog();
    };

    const [errors, setErrors] = useState({title: ''});

    const [election, setElection] = useState(defaultElection);

    const { t } = useSubstitutedTranslation();

    const { error, isPending, makeRequest: postElection } = usePostElection()

    const authSession = useAuthSession()
    const navigate = useNavigate()

    useEffect(() => {
        let q = createElectionContext.quickPoll;
        if(!createElectionContext.quickPoll) return;

        // quick poll also specifies a number of other settings but we're not keeping those, we're only keeping the information that the user specified
        setElection({
            ...defaultElection,
            title: q.title,
            races: [
                {
                    ...q.races[0],
                    title: q.title,
                    candidates: q.races[0].candidates.filter(candidate => candidate.candidate_name.length > 0)
                }
            ]
        }) 
    }, [createElectionContext.quickPoll])

    const onAddElection = async (election) => {
        // calls post election api, throws error if response not ok
        election.owner_id = authSession.getIdField('sub');

        const newElection = await postElection({
            Election: election,
        })
        if (!newElection)  throw Error("Error submitting election");

        navigate(`/${newElection.election.election_id}/admin`)
        onClose()
    }

    return <Dialog
        open={createElectionContext.open}
        onClose={onClose}
        scroll={'paper'}
        sx={{
            maxHeight: '90%',
            '@media(max-width: 500px)': {
                margin: '8px', // default is 32px
                maxHeight: 'calc(100% - 16px)',
                width: 'calc(100% - 16px)',
            }
        }}
        keepMounted
        fullWidth
        maxWidth='sm'
    >
        <DialogTitle> {t('election_creation.dialog_title')} </DialogTitle>
        <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                    <StepLabel>{t('election_creation.term_title')} <strong>{
                        election.settings.term_type === undefined? '' : t(`keyword.${election.settings.term_type}.election`)
                    }</strong></StepLabel>
                    <StepContent>
                        <Typography>{t('election_creation.term_question')}
                            <Tip name='polls_vs_elections'/>
                        </Typography>
                        <RadioGroup row>
                            {['poll', 'election'].map( (type, i) => 
                                <FormControlLabel
                                    key={i}
                                    value={t(`keyword.${type}.election`)}
                                    control={<Radio/>}
                                    label={t(`keyword.${type}.election`)}
                                    onClick={() => setElection({
                                        ...election,
                                        settings: {
                                            ...election.settings,
                                            term_type: type as TermType
                                        }
                                    })}
                                    checked={election.settings.term_type === type}
                                />
                            )}
                        </RadioGroup>
                        <StepButtons activeStep={activeStep} setActiveStep={setActiveStep} canContinue={election.settings.term_type !== undefined}/>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>{t('election_creation.title_title')} <strong>{election.title && election.title}</strong></StepLabel>
                    <StepContent>
                        <Typography>{t('election_creation.title_question')}</Typography>
                        <ElectionTitleField
                            value={election.title}
                            onUpdateValue={
                                (value) => setElection({...election, title: value})
                            }
                            errors={errors}
                            setErrors={setErrors}
                            showLabel={false}
                        />
                        <StepButtons activeStep={activeStep} setActiveStep={setActiveStep} canContinue={election.title != '' && errors.title == ''}/>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>{t('election_creation.restricted_title')} <strong>
                        {election.settings.voter_access !== undefined && t(`keyword.${election.settings.voter_access === 'closed'? 'yes' : 'no'}`)}
                    </strong></StepLabel>
                    <StepContent>
                        <Typography>
                            {t('election_creation.restricted_question')}
                            <Tip name='restricted'/>
                        </Typography>

                        <RadioGroup row>
                            {[true, false].map( (restricted, i) => 
                                <FormControlLabel
                                    key={i}
                                    value={restricted}
                                    control={<Radio/>}
                                    label={t(`keyword.${restricted? 'yes' : 'no'}`)}
                                    onClick={() => {
                                        setElection({...election, settings: { ...election.settings, voter_access: restricted? 'closed' : 'open' }})
                                    }}
                                    checked={election.settings.voter_access === (restricted? 'closed' : 'open')}
                                />
                            )}
                        </RadioGroup>
                        <StepButtons activeStep={activeStep} setActiveStep={setActiveStep} canContinue={election.settings.voter_access !== undefined}/>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>{t('election_creation.template_title')}</StepLabel>
                    <StepContent>
                        <Typography>
                            {t('election_creation.template_prompt')}
                        </Typography>
                        <Box style={{height: '10px'}}/> {/*hacky padding*/}
                        {(election.settings.voter_access === 'closed'? ['email_list', 'id_list'] : ['demo', 'public', 'unlisted']).map((name, i) =>
                            <StartingOption
                                title={t(`election_creation.${name}_title`)}
                                description={t(`election_creation.${name}_description`)}
                                key={i}
                                onClick={() => onAddElection(templateMappers[name](election))}
                            />
                        )}

                        <StepButtons activeStep={activeStep} setActiveStep={setActiveStep} canContinue={false}/>
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