import { Box, Button, Dialog, DialogContent, Stack, Step, StepConnector, StepContent, StepLabel, Stepper, TextField, Tooltip, Typography } from "@mui/material";
import { useState, createContext, useContext } from "react";
import { openFeedback, useSubstitutedTranslation } from "./util";

export interface IReturnToClassicContext{
    open: boolean,
    openDialog: () => void
    closeDialog: () => void
}

export const ReturnToClassicContext = createContext<IReturnToClassicContext>(null);

export const ReturnToClassicContextProvider = ({children}) => {
    const [open, setOpen] = useState(false);

    return <ReturnToClassicContext.Provider
        value={{
            open: open,
            openDialog: () => setOpen(true),
            closeDialog: () => setOpen(false)
        }}
    >
        {children}
    </ReturnToClassicContext.Provider>
}

export default () => {
    const returnToClassicContext = useContext(ReturnToClassicContext);
    const {t} = useSubstitutedTranslation('election');
    return <>
        <Dialog open={returnToClassicContext.open}>
            <DialogContent sx={{margin: 4}}>
                <Stack className="classicPopupInner">
                    <Typography align='center' >{t('return_to_classic.description')}</Typography>
                    <br/>
                    <Button
                        variant="contained"
                        sx={{
                            width: '80%',
                            m: 'auto',
                            p: 1,
                            boxShadow: 2,
                            fontWeight: 'bold',
                            fontSize: 18,
                        }}
                        onClick={() => {
                            openFeedback();
                            returnToClassicContext.closeDialog();
                        }}
                    >
                        {t('return_to_classic.feedback')}
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{
                            width: '70%',
                            m: 'auto',
                            mt: 2,
                            p: 1,
                            boxShadow: 2,
                            fontWeight: 'bold',
                            fontSize: 18,
                        }}
                        onClick={() => {
                            window.location.href=process.env.REACT_APP_CLASSIC_URL;
                        }}
                    >
                        {t('return_to_classic.continue')}
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    </>
}