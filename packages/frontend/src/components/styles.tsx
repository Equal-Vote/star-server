import { Button, ClickAwayListener, IconButton, Tooltip, responsiveFontSizes, styled } from "@mui/material"
import { TextField, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from "react";

const tips = {
    polls_vs_elections: ['Polls versus Elections', "There's no functional difference between polls and elections. This only impacts which terminology is shown to you and your voters."]
};

type TipName = keyof typeof tips;

interface TipProps{
    name: TipName
}

export const Tip = (props: TipProps) => {
    let [title, description] = tips[props.name];
    const [clicked, setClicked] = useState(false);
    const [hovered, setHovered] = useState(false);
    return <ClickAwayListener onClickAway={() => setClicked(false)}>
        <Tooltip
            title={<>
                <strong>{title}</strong>
                <br/>
                {description}
            </>}
            onOpen={() => setHovered(true)}
            onClose={() => setHovered(false)}
            open={clicked || hovered}
            placement='top'
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