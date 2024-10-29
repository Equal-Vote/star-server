import React, { useContext, useEffect } from 'react'
import { createContext, Dispatch, SetStateAction } from 'react'
import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import { useEditElection, useGetElection } from '../hooks/useAPI';
import { Election as IElection } from '@equal-vote/star-vote-shared/domain_model/Election';
import { VoterAuth } from '@equal-vote/star-vote-shared/domain_model/VoterAuth';
import structuredClone from '@ungap/structured-clone';
import { Share } from '@mui/icons-material';
import { Race } from '@equal-vote/star-vote-shared/domain_model/Race';
import { useSubstitutedTranslation } from './util';
import { ElectionResults } from '@equal-vote/star-vote-shared/domain_model/ITabulators';


export interface IRaceContext {
  raceIndex: number,
  race: Race,
  results: ElectionResults,
  t: Function
}

export const RaceContext = createContext<IRaceContext>({
  raceIndex: 0,
  race: null,
  results: null,
  t: () => {},
})

export const RaceContextProvider = ({ raceIndex, race, results, t, children }) => {
    return (<RaceContext.Provider value={{raceIndex, race, results, t}}>
        {children}
    </RaceContext.Provider>
    )
}

export default function useRace() {
    return useContext(RaceContext);
}
