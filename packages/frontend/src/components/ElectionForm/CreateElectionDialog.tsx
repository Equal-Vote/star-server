import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { StyledButton } from "../styles";
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";


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

export default () => {
    const createElectionContext = useContext(CreateElectionContext);

    const onClose = () => createElectionContext.setOpen(false);

    //https://mui.com/material-ui/react-stepper/
    //const activeStep = 

    return <Dialog
        open={createElectionContext.open}
        onClose={onClose}
        scroll={'paper'}
        keepMounted>
        <DialogTitle> Create Election </DialogTitle>
        <DialogContent>
            Hello
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