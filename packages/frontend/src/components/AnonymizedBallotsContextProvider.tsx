import { useContext } from 'react';
import { createContext } from 'react';
import { useGetAnonymizedBallots } from '../hooks/useAPI';
import { AnonymizedBallot } from '@equal-vote/star-vote-shared/domain_model/Ballot';


export interface IAnonymizedBallotsContext {
    ballots: AnonymizedBallot[] | null,
    fetchBallots: () => void,
}

export const AnonymizedBallotsContext = createContext<IAnonymizedBallotsContext >({
    ballots: null,
    fetchBallots: () => {},
})

export const AnonymizedBallotsContextProvider = ({ id, children }) => {
    const { data, isPending, error, makeRequest: fetchData } = useGetAnonymizedBallots(id)

    return (<AnonymizedBallotsContext.Provider
        value={{
            ballots: data?.ballots ?? null,
            fetchBallots: async () => {
                if(!data && !isPending) fetchData()
            }
        }}>
        {children}
    </AnonymizedBallotsContext.Provider>
    )
}

export default function useAnonymizedBallots() {
    return useContext(AnonymizedBallotsContext);
}
