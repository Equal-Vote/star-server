import React, { useContext, useEffect } from 'react'
import { createContext, Dispatch, SetStateAction } from 'react'
import { Election } from 'shared/domain_model/Election';
import { useEditElection, useGetElection } from '../hooks/useAPI';
import { Election as IElection } from 'shared/domain_model/Election';
import { VoterAuth } from 'shared/domain_model/VoterAuth';
import structuredClone from '@ungap/structured-clone';
import { Share } from '@mui/icons-material';


export interface IElectionContext {
    election: Election;
    voterAuth: VoterAuth;
    refreshElection: Function;
    updateElection: Function;
    permissions: string[];
}


export const ElectionContext = createContext<IElectionContext>({
    election: null,
    voterAuth: null,
    refreshElection: () => false,
    updateElection: () => false,
    permissions: [],
}
)

export const ElectionContextProvider = ({ id, children }) => {

    const { data, isPending, error, makeRequest: fetchData } = useGetElection(id)
    const { makeRequest: editElection } = useEditElection(id)

    useEffect(() => {
        fetchData()
    }, [id])

    const applyElectionUpdate = async (updateFunc: (election: IElection) => any) => {
        if (!data.election) return
        const electionCopy: IElection = structuredClone(data.election)
        updateFunc(electionCopy)
        return await editElection({ Election: electionCopy })
    };


    return (<ElectionContext.Provider
        value={{
            election: data?.election,
            voterAuth: data?.voterAuth,
            refreshElection: fetchData,
            updateElection: applyElectionUpdate,
            permissions: data?.voterAuth?.permissions,
        }}>
        {data && children}
    </ElectionContext.Provider>
    )
}

export default function useElection() {
    return useContext(ElectionContext);
}
