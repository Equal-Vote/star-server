import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react';
import { useEffect } from "react";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sharedConfig } from '@equal-vote/star-vote-shared/config';

type FeatureFlag = keyof typeof flagDefinitions;

export interface IFeatureFlags {
    isSet: (key: FeatureFlag) => Boolean
}

declare global {
    interface Window {
        registerMyFeatureFlags:any;
        featureFlagsPluginRegister:any;
    }
}

const FeatureFlagContext = createContext<IFeatureFlags>(null);

const flagDefinitions = {
    'RESET_FLAGS': 'Set this and refresh the page to return to defaults (sorry, it\'s a bit hacky)',
    'PUBLIC_ELECTIONS': 'Enables public elections tab is enabled in the navbar',
    'ELECTION_ROLES': 'Allows elections to have roles such as admin or auditor',
    'METHOD_STAR_PR': 'Enables STAR_PR',
    'METHOD_RANKED_ROBIN': 'Enables RankedRobin',
    'METHOD_APPROVAL': 'Enables Approval Voting',
    'METHOD_RANKED_CHOICE': 'Enables RCV / IRV',
    'CANDIDATE_DETAILS': 'Allows candidate details to be specified when creating elections',
    'CANDIDATE_PHOTOS': 'Allows candidate phtotos to be specified when creating elections',
    'MULTI_RACE': 'Allows multi race elections to be created',
    'MULTI_WINNER': 'Allows elections to multiple winners to be created',
    'CUSTOM_REGISTRATION': 'Enables the custom registration election type',
    'VOTER_FLAGGING': 'Allows voters to be flagged',
    'ELECTION_TALLY': 'Enables the election tally widget on the landing page',
    'ELECTION_TESTIMONIALS': 'Enables the election testimonials widget on the landing page',
    'PRECINCTS': 'Allows elections to groups voters by precinct',
    'THEMES': "Let's user pick a theme for their UI (temporarily via the top-right account button)",
    'ALL_STATS': 'Show all work in progress widgets under "Stats for Nerds"',
    'FORCE_DISABLE_RANDOM_CANDIDATES': '(testing only) Disables random candidate order on ballots',
    'FORCE_DISABLE_INSTRUCTION_CONFIRMATION': '(testing only) Disables confirmation prompt on ballots',
};

export function FeatureFlagContextProvider({ children }) {
    const [flagOverrides, setFlagOverrides] = useLocalStorage('flag_overrides', {});

    const isSet = (flagName: FeatureFlag) => {
        // check overrides
        if(flagName in flagOverrides) return flagOverrides[flagName];
        
        // then check environment
        return sharedConfig[`FF_${flagName}`] === 'true';
    }

    const setter = (key: FeatureFlag, value: boolean) => {
        if(key == 'RESET_FLAGS'){
            setFlagOverrides({});
            return;
        }

        // this is copied from useLocalStorage, because setter is passed to the plugin it seems to lose reference to flagOverrides so I'm setting it manually
        const saved = localStorage.getItem('flag_overrides');
        const initial = JSON.parse(saved);
        const overrides = initial ?? {};
        setFlagOverrides({
            ...overrides,
            [key]: value
        });
    }

    // register flags with plugin
    useEffect(() => {
        let setupFlags = Object.entries(flagDefinitions).map(([name, description]) => { return {
            key: name,
            value: isSet(name as FeatureFlag),
            description: description,
            title: name // This is optional defaulting to name according to the documentation, but that didn't work for me
        }})

        if (window.featureFlagsPluginRegister){
            window.featureFlagsPluginRegister(setupFlags, setter);
        }else{
            window.registerMyFeatureFlags = (register) => register(setupFlags, setter);
        }
    }, [])

    return (
        <FeatureFlagContext.Provider
            value={{isSet}}>
            {children}
        </FeatureFlagContext.Provider>
    );
}

export default function useFeatureFlags() {
    return useContext(FeatureFlagContext);
}