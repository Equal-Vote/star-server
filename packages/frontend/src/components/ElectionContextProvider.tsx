import React, { useContext, useEffect } from 'react'
import { createContext, Dispatch, SetStateAction } from 'react'
import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import { useEditElection, useGetElection } from '../hooks/useAPI';
import { Election as IElection } from '@equal-vote/star-vote-shared/domain_model/Election';
import { VoterAuth } from '@equal-vote/star-vote-shared/domain_model/VoterAuth';
import structuredClone from '@ungap/structured-clone';
import { Share } from '@mui/icons-material';
import { useSubstitutedTranslation } from './util';


export interface IElectionContext {
    election: Election;
    voterAuth: VoterAuth;
    refreshElection: Function;
    updateElection: Function;
    permissions: string[];
    t: Function
}


export const ElectionContext = createContext<IElectionContext>({
    election: null,
    voterAuth: null,
    refreshElection: () => false,
    updateElection: () => false,
    permissions: [],
    t: () => {}
})

export const ElectionContextProvider = ({ id, children }) => {
    const { data, isPending, error, makeRequest: fetchData } = useGetElection(id)
    const { makeRequest: editElection } = useEditElection(id)

    useEffect(() => {
        if(id != undefined) fetchData()
    }, [id])

    const applyElectionUpdate = async (updateFunc: (election: IElection) => any) => {
        if (!data.election) return
        const electionCopy: IElection = structuredClone(data.election)
        updateFunc(electionCopy)
        return await editElection({ Election: electionCopy })
    };

    // This should use local timezone by default, consumers will have to call it directly if they want it to use the election timezone
    const {t} = useSubstitutedTranslation(data?.election?.settings?.term_type ?? 'election');

    return (<ElectionContext.Provider
        value={{
            election: data?.election,
            voterAuth: data?.voterAuth,
            refreshElection: fetchData,
            updateElection: applyElectionUpdate,
            permissions: data?.voterAuth?.permissions,
            t,
        }}>
        {(data || id == undefined) && children}
    </ElectionContext.Provider>
    )
}

export default function useElection() {
    return useContext(ElectionContext);
}
