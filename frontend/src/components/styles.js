import { Button, styled } from "@mui/material"
import { TextField, useTheme } from '@mui/material';

export const StyledButton = (props) => (
    <Button
        fullWidth
        sx={{
            p: { xs: 1, sm: 1 },
            m: { xs: 0, sm: 1 },
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
            m: { xs: 0, sm: 1 },
            boxShadow: 2,
        }}
        {...props}
    >
        {props.children}
    </TextField>
)