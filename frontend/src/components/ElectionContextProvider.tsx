import React, { useContext, useEffect } from 'react'
import { createContext, Dispatch, SetStateAction } from 'react'
import { Election } from '../../../domain_model/Election';
import { useEditElection, useGetElection } from '../hooks/useAPI';
import { Election as IElection } from '../../../domain_model/Election';
import { VoterAuth } from '../../../domain_model/VoterAuth';
import structuredClone from '@ungap/structured-clone';


export interface IElectionContext {
    data: {election: Election, voterAuth: VoterAuth}
    election: Election;
    refreshElection: Function;
    updateElection: Function;
    permissions: string[]
}


export const ElectionContext = createContext<IElectionContext>({
    data: null,
    election: null,
    refreshElection: () => false,
    updateElection: () => false,
    permissions: []
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
            data: data,
            election: data?.election,
            refreshElection: fetchData,
            updateElection: applyElectionUpdate,
            permissions: data?.voterAuth?.permissions
        }}>
        {data && children}
    </ElectionContext.Provider>
    )
}

export default function useElection() {
    return useContext(ElectionContext);
}