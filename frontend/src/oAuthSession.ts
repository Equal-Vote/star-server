import jwt_decode from 'jwt-decode'

const REFRESH_HOURS = 1;
const SERVER_PORT = 5000;

export class oAuthSession {
    clientId: string;
    responseType: string;
    redirectUri: string;
    endpoints: {[key: string]: string};

    constructor({clientId, responseType, redirectUri, endpoints}) {
        console.log("init auth");
        this.clientId = clientId;
        this.responseType = responseType;
        this.redirectUri = redirectUri;
        this.endpoints = endpoints;

        this.refreshSession();
    }

    // TODO: If we find ourselves using cookies more often, maybe we can consider moving the cookie functions to a shared utils module
    private setCookie(name,value,hours=null) {
        var expires = "";
        if (hours) {
            var date = new Date();
            date.setTime(date.getTime() + (hours*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }


    private getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0){
            return c.substring(nameEQ.length,c.length);
            }
        }
        return null;
    }

    private cookieExists(name){
        return this.getCookie(name) != null;
    }

    private deleteCookie(name) {
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }


    isLoggedIn(): boolean{
        // insepct cookie
        return this.getCookie('access_token') != null;
    }

    private refreshSession(): void{
        // This function refreshes our tokens (which we store as cookies)
        // There are 3 types of tokens
        //      Access Token: We'll use this to prove our authentication status on future requests 
        //          (more details: https://swagger.io/docs/specification/authentication/bearer-authentication/)
        //      Refresh Token: Access tokens are usually configured to expire after a short period. If they expire the service
        //          can use the refresh token to get new tokens. This is nice because we can refresh the session without requiring a new login
        //      ID Token: This contains metadata about the user (ex. email, nickname, etc, depending on how you configure it). ID tokens are included
        //          as part of the OIDC specification, which is an extension of the origianl oAuth specification
        // Also all tokens are formatted as JWTs (more details here: https://en.wikipedia.org/wiki/JSON_Web_Token)

        if(this.isLoggedIn()){
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
        if(auth_code == null && !this.cookieExists('refresh_token')){
            console.log("No code or refresh token available, can't refresh");
            return;
        }
        const grant_type = (auth_code == null)? 'refresh_token' : 'authorization_code';
        /* The full URL approach wasn't reaching the server, I feel like there was a reason I avoided relative paths, but I don't remember it
        var token_url = `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`+
                        `/API/Token?grant_type=${grant_type}&redirect_uri=${this.redirectUri}`;
        */
        var token_url = `/API/Token?grant_type=${grant_type}&redirect_uri=${this.redirectUri}`;

        if(grant_type == 'authorization_code'){
            token_url = `${token_url}&code=${auth_code}`
        }

        // Call Server API to retrieve token
        // NOTE: the server is pretty much a passthrough to our authorization service (ex. congito/keycloak), I could call the api directly, but
        //          going through the server ensures that we don't expose our secret api key to the client
        if(grant_type != null){
            // TODO: window.location works locally, but I should test on heroku to make sure it works there as well
            // Q: Why don't use just use window.location.origin?
            // A: origin includes the port (ex. http://localhost:3000), but I want to use the server port, so I reconstructing the first part (ex. http://localhost)
            fetch(token_url, {
               method: 'POST',
                // 'include' allows the backend to access the same cookies https://developers.google.com/web/updates/2015/03/introduction-to-fetch
               credentials: 'include', 
            }).then(response => {
                console.log("status: "+response.status);
                if(response.ok){
                    return response.json();
                }
                throw new Error('Error Code: '+response.status);
            }).then(data => {
                console.log("Successfully fetched tokens!!")
                // NOTE: Here I'm setting the cookies to expire after REFRESH_HOURS
                //       I should probably be configuring the expiration time through the oAuth provider instead
                //       but for now it's convenient to set the expiration time for the cookie and then force a refresh
                this.setCookie('access_token', data['access_token'], REFRESH_HOURS);
                this.setCookie('id_token', data['id_token'], REFRESH_HOURS);
                if(grant_type == 'authorization_code'){ // we only receive refresh token on auth code flow
                    this.setCookie('refresh_token', data['refresh_token'], REFRESH_HOURS);
                }
            }).catch(error => console.log('fetch error: '+error));
        }
    }

    openLogin(){
        const queryString = [
            `client_id=${this.clientId}`,
            `response_type=${this.responseType}`,
            `redirect_uri=${this.redirectUri}`,
            `scope=openid`,
        ].join('&');

        window.location.href = this.endpoints.login+"?"+queryString;
    }

    openLogout(){
        this.deleteCookie("access_token");
        this.deleteCookie("id_token");
        this.deleteCookie("refresh_token");

        const queryString = [
            `client_id=${this.clientId}`,
            `logout_uri=${this.redirectUri}`,
        ].join('&');

        window.location.href = this.endpoints.logout+"?"+queryString;
    }

    getIdField(fieldName){
        const id_map = jwt_decode(this.getCookie('id_token'));
        return id_map[fieldName];
    }
}