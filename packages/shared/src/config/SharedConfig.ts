export const sharedConfig = {
    FREE_TIER_PRIVATE_VOTER_LIMIT: 100,
    ELECTION_VOTER_LIMIT_OVERRIDES: {
        'ee948c52-f79e-4449-acb1-1296debc0884': 10,
        'h33qt8': 1000, // Brianna Johns, Gathering for Open Science Hardware
        '7tcryp': 3000, // DSA-LA 2025 Local Officer Election
        'j87vqp': 3000, // DSA-LA 2025 Local Officer Election #2
    },
    ACCOUNT_CUSTOM_REGISTRATION_OVERRIDES: [
        '84724136-bb4d-41be-8202-3373a1a1c934', // Arend's Keycloak sub
    ],
    CLASSIC_DOMAIN: 'https://star.vote',
    FF_METHOD_STAR_PR: 'true',
    FF_METHOD_RANKED_ROBIN: 'true',
    FF_METHOD_APPROVAL: 'true',
    FF_METHOD_RANKED_CHOICE: 'true',
    FF_CANDIDATE_DETAILS: 'false',
    FF_CANDIDATE_PHOTOS: 'false',
    FF_MULTI_RACE: 'true',
    FF_MULTI_WINNER: 'true',
    FF_CUSTOM_REGISTRATION: 'false',
    FF_VOTER_FLAGGING: 'false',
    FF_ELECTION_TESTIMONIALS: 'false',
    FF_PRECINCTS: 'false',
    FF_ALL_STATS: 'false',
};
