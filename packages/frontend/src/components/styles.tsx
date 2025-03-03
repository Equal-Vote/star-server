import { Box, Button, ClickAwayListener, IconButton, Tooltip, responsiveFontSizes, styled } from "@mui/material"
import { TextField, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from "react";
import en from './en.yaml';
import { useSubstitutedTranslation } from "./util";
import { TermType } from "@equal-vote/star-vote-shared/domain_model/ElectionSettings";
import useRace from "./RaceContextProvider";
import useElection from "./ElectionContextProvider";
import { Link } from "react-router-dom";

// this doesn't work yet, I filed a github issue
// https://github.com/Modyfi/vite-plugin-yaml/issues/27
type TipName = keyof typeof en.tips;


export const Tip = (props: {name?: TipName, children?: any, content?: any}) => {
    // TODO: maybe I can insert useElection and useRace within useSubstitutedTranslation?
    const {t: ts, i18n} = useSubstitutedTranslation('election');
    const {t: te} = useElection();
    const {t: tr} = useRace();
    let t = (tr() !== undefined) ? tr : (
        (te() !== undefined) ? te : ts
    );

    const [clicked, setClicked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const learnLinkKey = props.name ? `tips.${props.name as string}.learn_link` : 'asdfasdf';
    return <ClickAwayListener onClickAway={() => setClicked(false)}>
        <Tooltip
            title={<>
                <strong>{props.name ? t(`tips.${props.name as string}.title`) : props.content.title}</strong>
                <br/>
                {props.name ? t(`tips.${props.name as string}.description`) : props.content.description}
                {i18n.exists(learnLinkKey) && <a href={t(learnLinkKey)} target='_blank'>Learn More</a>}
            </>}
            onOpen={() => setHovered(true)}
            onClose={() => setHovered(false)}
            open={clicked || hovered}
            placement='top'
            componentsProps={{
                tooltip: {
                    sx: {
                        background: '#2B344AFF', 
                        border: '2px solid white',
                        //boxShadow: '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
                    }
                }
            }}
        >
            {props.children ?
                props.children
            : 
            <IconButton size='small' sx={{marginBottom: 1}} onClick={() => setClicked(true)}>
                <InfoOutlinedIcon fontSize='inherit'/>
            </IconButton>}
        </Tooltip>
    </ClickAwayListener>
}

export const PrimaryButton = (props) => (
    <Button
        variant="contained"
        {...props}
        sx={{
            p: 1,
            m: 0,
            boxShadow: 0,
            //backgroundColor: 'primary.main',
            backgroundColor: 'var(--brand-pop)',//'#073763',
            fontFamily: 'Montserrat, Verdana, sans-serif',
            fontWeight: 'bold',
            fontSize: 18,
            color: 'primary.contrastText',
            //'&:hover': {
            //    backgroundColor: 'black',
            //}
            ...props.sx,
        }}
    >
        {props.children}
    </Button>
)

export const SecondaryButton = (props) => (
    <Button
        variant="outlined"
        {...props}
        sx={{
            p: 1,
            fontWeight: 'bold',
            fontSize: 16,
            color: 'var(--brand-pop)',
            borderColor: 'var(--brand-pop)',
            '&:hover': {
                color: 'black',
                borderColor: 'black',
            },
            ...props.sx,
        }}
    >
        {props.children}
    </Button>
)


export const StyledTextField = (props) => (
    <TextField
        className='styledTextField'
        fullWidth
        sx={{
            m: 0,
            p: 0,
            boxShadow: 0, // this is set manually in index.css. By default MUI creates weird corner artifacts
            // backgroundColor: 'lightShade.main',
        }}
        {...props}
    >
        {props.children}
    </TextField>
)