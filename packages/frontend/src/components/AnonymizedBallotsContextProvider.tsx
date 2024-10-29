import { useContext } from 'react';
import { createContext } from 'react';
import { useGetAnonymizedBallots } from '../hooks/useAPI';
import { AnonymizedBallot } from '@equal-vote/star-vote-shared/domain_model/Ballot';
import { Score } from '@equal-vote/star-vote-shared/domain_model/Score';
import useRace from './RaceContextProvider';

export interface IAnonymizedBallotsContext {
    ballots: AnonymizedBallot[] | null,
    fetchBallots: () => void,
    ballotsForRace: () => Score[][],
}

export const AnonymizedBallotsContext = createContext<IAnonymizedBallotsContext >({
    ballots: null,
    fetchBallots: () => {},
    ballotsForRace: () => []
})

export const AnonymizedBallotsContextProvider = ({ id, children }) => {
    const { data, isPending, error, makeRequest: fetchData } = useGetAnonymizedBallots(id)

    return (<AnonymizedBallotsContext.Provider
        value={{
            ballots: data?.ballots ?? null,
            fetchBallots: async () => {
                if(!data && !isPending) fetchData()
            },
            ballotsForRace: () => {
                const {race} = useRace();
                return data?.ballots
                    .map(b =>
                        b.votes
                        .filter(v => v.race_id == race.race_id)
                        .map(v => v.scores)
                    )
                    .flat() ?? []
            }
        }}>
        {children}
    </AnonymizedBallotsContext.Provider>
    )
}

export default function useAnonymizedBallots() {
    return useContext(AnonymizedBallotsContext);
}
