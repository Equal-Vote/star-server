import { Button, styled } from "@mui/material"
import { TextField, useTheme } from '@mui/material';

export const StyledButton = (props) => (
    <Button
        fullWidth
        sx={{
            p: 1,
            m: 0,
            boxShadow: 2,
            backgroundColor: 'primary.light'
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