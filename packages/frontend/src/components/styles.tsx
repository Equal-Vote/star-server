import { Box, Button, ClickAwayListener, IconButton, Tooltip, responsiveFontSizes, styled } from "@mui/material"
import { TextField, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from "react";
import en from './en.yaml';
import { useSubstitutedTranslation } from "./util";
import { TermType } from "@equal-vote/star-vote-shared/domain_model/ElectionSettings";
import useRace from "./RaceContextProvider";
import useElection from "./ElectionContextProvider";

// this doesn't work yet, I filed a github issue
// https://github.com/Modyfi/vite-plugin-yaml/issues/27
type TipName = keyof typeof en.tips;


export const Tip = (props: {name: TipName}) => {
    // TODO: maybe I can insert useElection and useRace within useSubstitutedTranslation?
    const {t: ts} = useSubstitutedTranslation('election');
    const {t: te} = useElection();
    const {t: tr} = useRace();
    let t = (tr() !== undefined) ? tr : (
        (te() !== undefined) ? te : ts
    );

    const [clicked, setClicked] = useState(false);
    const [hovered, setHovered] = useState(false);
    return <ClickAwayListener onClickAway={() => setClicked(false)}>
        <Tooltip
            title={<>
                <strong>{t(`tips.${props.name as string}.title`)}</strong>
                <br/>
                {t(`tips.${props.name as string}.description`)}
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
            <IconButton size='small' sx={{marginBottom: 1}} onClick={() => setClicked(true)}>
                <InfoOutlinedIcon fontSize='inherit'/>
            </IconButton>
        </Tooltip>
    </ClickAwayListener>
}

export const StyledButton = (props) => (
    <Button
        fullWidth
        sx={{
            p: 1,
            m: 0,
            boxShadow: 2,
            //backgroundColor: 'primary.main',
            fontFamily: 'Montserrat, Verdana, sans-serif',
            fontWeight: 'bold',
            fontSize: 18,
            //color: 'primary.contrastText',
        }}
        {...props}
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
            backgroundColor: 'lightShade.main',
        }}
        {...props}
    >
        {props.children}
    </TextField>
)