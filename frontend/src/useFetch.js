import { useEffect, useState } from "react";


const useFetch = (url,options) => {
    const [isPending,setIsPending] = useState(true)
    const [error,setError] = useState(null)
    const [data,setData] = useState(null)


    useEffect(() => {
        setTimeout(() => {
            fetch(url,options)
            .then(res => {
                if(!res.ok) {
                    throw Error('Could not fetch data')
                }
                return res.json();
            })
            .then(data=> {
                setData(data);
                setIsPending(false);
                setError(null);
            })
            .catch(err => {
                setIsPending(false);
                setError(err.message);
            })
        },1000);
    },[url])
    return {data, isPending, error}
}

export default useFetch;