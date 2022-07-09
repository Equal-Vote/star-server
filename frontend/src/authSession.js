import { oAuthSession } from './oAuthSession'
/* oAuth2 reference
 * Express Guide: https://www.youtube.com/watch?v=Ppeqd9xXp3Q 
 * Cognito oAuth Endpoints Reference: https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
 * Auth0 Endpoints: https://auth0.com/docs/authorization/protocols/protocol-oauth2
 * openid.net: https://openid.net/specs/openid-connect-core-1_0.html
 */


console.log("trying to start app...");
// http://keycloak.6j0.org/auth/realms/STAR%20Voting/.well-known/openid-configuration

// TODO: insert urls for keycloak 
const prodEndpoints = [
    'https://star-vote.herokuapp.com/',
  ];
let keycloakBaseUrl;
if (prodEndpoints.includes(window.location.origin)) {
    keycloakBaseUrl = 'https://52.205.245.149:8443/realms/STAR%20Voting/protocol/openid-connect';
} else {
    keycloakBaseUrl = 'https://52.205.245.149:8443/realms/STAR%20Voting%20Dev/protocol/openid-connect';
}

const keycloakAuthConfig = {
    clientId: 'star_vote_web',
    responseType: 'code',
    redirectUri: window.location.origin,
    logoutUri: window.location.origin,
    endpoints: {
        login: `${keycloakBaseUrl}/auth`,
        logout: `${keycloakBaseUrl}/logout`,
        token: `${keycloakBaseUrl}/token`,
        authorize: `${keycloakBaseUrl}/auth`,
        userinfo: `${keycloakBaseUrl}/userinfo`
    },
}

// TODO: load all the above values from a yaml file

const authConfig = keycloakAuthConfig;

const authSession = new oAuthSession({
    clientId: authConfig.clientId,
    responseType: authConfig.responseType,
    redirectUri: authConfig.redirectUri,
    endpoints: authConfig.endpoints,
})

export default authSession;