import { Button, ClickAwayListener, IconButton, Tooltip, responsiveFontSizes, styled } from "@mui/material"
import { TextField, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from "react";
import en from './en.yaml';
import { useSubstitutedTranslation } from "./util";

// this doesn't work yet, I filed a github issue
// https://github.com/Modyfi/vite-plugin-yaml/issues/27
type TipName = keyof typeof en.tips;


export const Tip = (props: {name: TipName}) => {
    const {t} = useSubstitutedTranslation('election');
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
                        background: '#888888FF'
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
            backgroundColor: 'primary.main',
            fontWeight: 'bold',
            fontSize: 18,
        }}
        {...props}
    >
    {props.children}
    </Button>
)

export const StyledTextField = (props) => (
    <TextField
        fullWidth
        sx={{
            m: 0,
            p: 0,
            boxShadow: 2,
        }}
        {...props}
    >
        {props.children}
    </TextField>
)