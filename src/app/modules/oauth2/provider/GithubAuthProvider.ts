import axios from "axios";
import { AbstractOAuth2Provider } from "../abstract";
import helpers from "@/utils/helpers";
export class GithubAuthProvider extends AbstractOAuth2Provider {
    getAuthUrl(): string {
        const baseUrl = "https://github.com/login/oauth/authorize";
        const scope = "repo";
        return `${baseUrl}?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code&scope=${scope}`;
    }

    async handleCallback<T>(code: string): Promise<T> {      
        const { data } = await axios.post("https://github.com/login/oauth/access_token", {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            redirect_uri: this.redirectUri,
            grant_type: "authorization_code",
        });
        return data as T;
    }
    async refreshToken<T>(refresh_token: string): Promise<T> {    
        const queryString =  `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=refresh_token&refresh_token=${refresh_token}`  
        const { data } = await axios.post("https://github.com/login/oauth/access_token?"+queryString );
        return data as T;
    }
}

