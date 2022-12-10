import { useState, useEffect } from "react";
import { useCookie } from "./useCookie";
import jwt_decode from 'jwt-decode'
let keycloakBaseUrl = 'https://auth.star.vote:8443/realms/STAR%20Voting%20Dev/protocol/openid-connect';
// if (prodEndpoints.includes(window.location.origin)) {
//     keycloakBaseUrl = 'https://auth.star.vote:8443/realms/STAR%20Voting/protocol/openid-connect';
// } else {
//     keycloakBaseUrl = 'https://auth.star.vote:8443/realms/STAR%20Voting%20Dev/protocol/openid-connect';
// }

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

export const useAuthSession = () => {
    const [accessToken, setAccessToken] = useCookie('access_token', null, 1)
    const [idToken, setIdToken] = useCookie('id_token', null, 1)
    const [refreshToken, setRefreshToken] = useCookie('refresh_token', null, 1)

    const isLoggedIn = () => {
        return accessToken !== null
    }

    const openLogin = () => {
        const queryString = [
            `client_id=${authConfig.clientId}`,
            `response_type=${authConfig.responseType}`,
            `redirect_uri=${authConfig.redirectUri}`,
            `scope=openid`,
        ].join('&');

        window.location.href = authConfig.endpoints.login+"?"+queryString;
    }

    const openLogout = () => {
        setAccessToken(null)
        setIdToken(null)
        setRefreshToken(null)

        const queryString = [
            `client_id=${authConfig.clientId}`,
            `logout_uri=${authConfig.redirectUri}`,
        ].join('&');

        window.location.href = authConfig.endpoints.logout+"?"+queryString;
    }

    const getIdField = (fieldName) => {
        const id_map = jwt_decode(idToken);
        return id_map[fieldName];
    }

    useEffect( () => {
        refreshSession()
    },[])

    const refreshSession = () => {
        // This function refreshes our tokens (which we store as cookies)
        // There are 3 types of tokens
        //      Access Token: We'll use this to prove our authentication status on future requests 
        //          (more details: https://swagger.io/docs/specification/authentication/bearer-authentication/)
        //      Refresh Token: Access tokens are usually configured to expire after a short period. If they expire the service
        //          can use the refresh token to get new tokens. This is nice because we can refresh the session without requiring a new login
        //      ID Token: This contains metadata about the user (ex. email, nickname, etc, depending on how you configure it). ID tokens are included
        //          as part of the OIDC specification, which is an extension of the origianl oAuth specification
        // Also all tokens are formatted as JWTs (more details here: https://en.wikipedia.org/wiki/JSON_Web_Token)

        if (isLoggedIn()) {
            console.log("Already logged in, no need to refresh");
            return;
        }

        // Select Token retrieval method
        // Authorization Code: 
        //      When users initially login through oAuth, the browser will be redirected our website, and it will inclue the auth code in the query parameters
        //      This tempoary code can then be used the retrieve tokens
        // Refresh Token: 
        //      If the user is already logged in and their access token expires, 
        //      This tempoary code can then be used the retrieve tokens

        const url_params = new URLSearchParams(window.location.search);
        const auth_code = url_params.get('code');
        if (auth_code == null && refreshToken !== null) {
            console.log("No code or refresh token available, can't refresh");
            return;
        }
        const grant_type = (auth_code == null) ? 'refresh_token' : 'authorization_code';
        /* The full URL approach wasn't reaching the server, I feel like there was a reason I avoided relative paths, but I don't remember it
        var token_url = `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`+
                        `/API/Token?grant_type=${grant_type}&redirect_uri=${this.redirectUri}`;
        */
        var token_url = `/API/Token?grant_type=${grant_type}&redirect_uri=${authConfig.redirectUri}`;

        if (grant_type == 'authorization_code') {
            token_url = `${token_url}&code=${auth_code}`
        }

        // Call Server API to retrieve token
        // NOTE: the server is pretty much a passthrough to our authorization service (ex. congito/keycloak), I could call the api directly, but
        //          going through the server ensures that we don't expose our secret api key to the client
        if (grant_type != null) {
            // TODO: window.location works locally, but I should test on heroku to make sure it works there as well
            // Q: Why don't use just use window.location.origin?
            // A: origin includes the port (ex. http://localhost:3000), but I want to use the server port, so I reconstructing the first part (ex. http://localhost)
            fetch(token_url, {
                method: 'POST',
                // 'include' allows the backend to access the same cookies https://developers.google.com/web/updates/2015/03/introduction-to-fetch
                credentials: 'include',
            }).then(response => {
                console.log("status: " + response.status);
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Error Code: ' + response.status);
            }).then(data => {
                console.log("Successfully fetched tokens!!")
                // NOTE: Here I'm setting the cookies to expire after REFRESH_HOURS
                //       I should probably be configuring the expiration time through the oAuth provider instead
                //       but for now it's convenient to set the expiration time for the cookie and then force a refresh
                setAccessToken( data['access_token'] );
                setIdToken(data['id_token']);
                if (grant_type == 'authorization_code') { // we only receive refresh token on auth code flow
                    setRefreshToken(data['refresh_token']);
                }
            }).catch(error => console.log('fetch error: ' + error));
        }

    }
        return {isLoggedIn, openLogin, openLogout, getIdField}
}