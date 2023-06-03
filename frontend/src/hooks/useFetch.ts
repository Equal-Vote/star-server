import { useEffect, useState, useContext } from "react";
import { SnackbarContext } from "../components/SnackbarContext";

export interface IuseFetch { 
    data?: any
    isPending: Boolean,
    error: any,
    makeRequest: (data?:any) =>  Promise<any>
}

const useFetch = (url, method, successMessage = null) => {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)
    const { snack, setSnack } = useContext(SnackbarContext)

    const makeRequest = async (data?: any) => {
        const options = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        setIsPending(true);
        try {
            const res = await fetch(url, options)
            if (!res.ok) {
                var contentType = res.headers.get('content-type')

                if (contentType && contentType.indexOf('application/json') !== -1) {
                    const data = await res.json();
                    throw Error(`Error making request: ${res.status.toString()}: ${data.error}`)
                } else {
                    throw Error(`Error making request: ${res.status.toString()}`)
                }
            }
            const data = await res.json();
            setData(data);
            setIsPending(false);
            setError(null);
            if (successMessage !== null) {
                setSnack({
                    message: successMessage,
                    severity: 'success',
                    open: true,
                    autoHideDuration: 6000,
                })
            }
            return data
        } catch (err) {
            setSnack({
                message: err.message,
                severity: "error",
                open: true,
                autoHideDuration: null
            })
            setIsPending(false);
            setError(err.message);
            return false
        }
    }
    return { data, isPending, error, makeRequest }
}

export default useFetch;