import { useEffect, useState } from "react";


const useFetch = (url, method) => {
    const [isPending, setIsPending] = useState(true)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)

    const makeRequest = async (data) => {
        const options = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        try {
            const res = await fetch(url, options)
            if (!res.ok) {
                if (res.json.length > 0) {
                    console.log(res)
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
            return true
        } catch (err) {
            setIsPending(false);
            setError(err.message);
            return false
        }
    }
    return { data, isPending, error, makeRequest }
}

export default useFetch;