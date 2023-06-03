import React from 'react'
import { createContext, Dispatch, SetStateAction } from 'react'

export interface Isnack {
    message: string,
    severity: 'error' | 'info' | 'success' | 'warning',
    open: boolean,
    autoHideDuration: number | null,
}


export const SnackbarContext = createContext({
    snack: {
        message: '',
        severity: "info",
        open: false,
        autoHideDuration: null,
    } as Isnack,
    setSnack: null as Dispatch<SetStateAction<Isnack>>
}
)