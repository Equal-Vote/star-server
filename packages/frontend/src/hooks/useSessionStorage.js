import { useState, useEffect } from "react";

export const useSessionStorage = (key, defaultValue, updateRate = null) => {
    // This hook behaves similarly to useState however the state is also stored in session storage
    // If the value in local storage doesn't exist it is set to defaultValue
    // The optional input updateRate allows for periodic checking to see if the value in session storage has changed
    // to allow multiple components using the same key to be updated
    const getStoredValue = (key, defaultValue) => {
        // getting stored value
        const saved = sessionStorage.getItem(key);
        const initial = JSON.parse(saved);
        if (!initial) {
            sessionStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue
        }
        return initial;
    }
    
    const [value, setStoredValue] = useState(() => {
        return getStoredValue(key, defaultValue);
    });
    

    const setValue = (newValue) => {
        sessionStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue)
    }

    useEffect(() => {
        if (updateRate) {
            const interval = setInterval(() => {
                setStoredValue(getStoredValue(key, defaultValue))
            }, updateRate);
            return () => clearInterval(interval); //Cleanup function
        }
    }, [value])
    return [value, setValue];
};