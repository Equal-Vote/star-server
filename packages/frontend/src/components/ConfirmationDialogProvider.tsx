import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { StyledButton } from './styles';
// Built from this example buth with MUI dialogs: https://akashhamirwasia.com/blog/building-expressive-confirm-dialog-api-in-react/
// Uses a context provider to allow any component to access a confirm dialog component using the useConfirm hook
// Example: 
// import useConfirm from '../../ConfirmationDialogProvider';
// const confirm = useConfirm()
// const confirmed = await confirm(
//      {
//          title: 'Confirm This Action', 
//          message: "Are you sure you want to do this?"
//      })

interface ConfirmData {
    title: string
    message: string
}

type confirmContext = (data: ConfirmData) => Promise<boolean>

const ConfirmDialog = createContext<confirmContext>(null);

export function ConfirmDialogProvider({ children }) {


    const [state, setState] = useState({ isOpen: false, title: '', message: '' });
    const fn = useRef((choice: boolean) => { });

    const confirm = useCallback(
        (data: ConfirmData) => {
            return new Promise((resolve: (value: boolean) => void) => {
                setState({ ...data, isOpen: true });
                fn.current = (choice) => {
                    resolve(choice);
                    setState({ isOpen: false, title: '', message: '' });
                };
            });
        },
        [setState]
    );

    return (
        <ConfirmDialog.Provider value={confirm}>
            {children}
            <Dialog
                open={state.isOpen}
                fullWidth
            >
                <DialogTitle>{state.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{state.message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <StyledButton
                        type='button'
                        variant="contained"
                        width="100%"
                        fullWidth="false"
                        onClick={() => fn.current(false)}>
                        Cancel
                    </StyledButton>
                    <StyledButton
                        type='button'
                        variant="contained"
                        fullWidth="false"
                        onClick={() => fn.current(true)}>
                        Submit
                    </StyledButton>
                </DialogActions>
            </Dialog>
        </ConfirmDialog.Provider>
    );
}

export default function useConfirm() {
    return useContext(ConfirmDialog);
}