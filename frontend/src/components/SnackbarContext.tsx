import React from 'react'
import { createContext, Dispatch, SetStateAction } from 'react'

export interface Isnack {
    message: string,
    severity: 'error' | 'info' | 'success' | 'warning',
    open: boolean,
    autoHideDuration: number | null,
}

export interface ISnackBarContext {
    snack: Isnack;
    setSnack: Dispatch<SetStateAction<Isnack>>
}


export const SnackbarContext = createContext<ISnackBarContext>({
    snack: {
        message: '',
        severity: "info",
        open: false,
        autoHideDuration: null,
    } as Isnack,
    setSnack: () => false
}
)