export const sharedConfig = {
    FREE_TIER_PRIVATE_VOTER_LIMIT: 20,
    ELECTION_VOTER_LIMIT_OVERRIDES: {
        'ee948c52-f79e-4449-acb1-1296debc0884': 10,
        'h33qt8': 1000, // Brianna Johns, Gathering for Open Science Hardware
    },
    ACCOUNT_CUSTOM_REGISTRATION_OVERRIDES: [
        '84724136-bb4d-41be-8202-3373a1a1c934', // Arend's Keycloak sub
    ],
    CLASSIC_DOMAIN: 'https://star.vote'
};
