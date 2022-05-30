import { useEffect, useState } from "react";
import useFetchSetData from "./useFetchSetData";

export const useFetch = (url,options) => {
   const {data, setData, isPending, error} = useFetchSetData(url, options);

   return {data, isPending, error};
}

export default useFetch;