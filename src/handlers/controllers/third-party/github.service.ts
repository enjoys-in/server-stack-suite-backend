import axios from "axios";
import { AllRepositorieshooks, SelectedRepoWebhookResponse } from "./interface";
import { AuthProviderFactory } from "@/app/modules/oauth2/oauth2factory";
import helpers from "@/utils/helpers";
import { GithubAuthProviderResponse } from "@/utils/interfaces/providers.interfac";
import { OnAppReady, OnAppShutDown } from "@/utils/interfaces/application.interface";
import { readFile, readFileSync, writeFileSync } from "fs";
import { SystemOperations } from "@/handlers/providers/system-operations";


class GithubService implements OnAppReady, OnAppShutDown {
    private _accessToken: string | null = null;
    private _refreshToken: string | null = null;
    
    onAppReady() {
        readFile("./github.json", "utf8", async(err, data) => {
            if (err) {
                console.log(err)
                return
            }
            let parsedData = JSON.parse(data) as GithubAuthProviderResponse
            // if (!this.checkTokenValidity(+parsedData.expires_in,"h",1)) {
            //     await this.handleAxiosUnAuthorized()
            // }
            // if (!this.checkTokenValidity(+parsedData.refresh_token_expires_in,"m",6)) {
            //     delete AuthProviderFactory.authSessions()["github"]
            // }
            this._accessToken = parsedData.access_token;
            this._refreshToken = parsedData.refresh_token;
            return this
        })
    }
    onAppShutDown(): void {
        const githubSession = AuthProviderFactory.authSessions()["github"]
        if (githubSession) {
            writeFileSync("./github.json", JSON.stringify(helpers.queryToObject(githubSession), null, 2));
        }
    }
    constructor() {
        axios.interceptors.response.use(response => response, async (errors) => {
            if (errors.response && errors.response.status === 401) {
                await this.handleAxiosUnAuthorized()
                return axios.request(errors.config)
            }
            throw errors
        })
    }
    checkTokenValidity(unixTime: number,format:"s"|"h"|"d"|"m",from:number) {
        switch (format) {
            case "s": return unixTime < Math.floor(Date.now() / 1000) + from;
            case "h": return unixTime < Math.floor(Date.now() / 1000) + from;
            case "d": return unixTime < Math.floor(Date.now() / 1000) + from;
            case "m": return unixTime < Math.floor(Date.now() / 1000) + from;
        }
        
    }
    setCredentials(accessToken: string, refreshToken: string) {
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
        return this
    }
    async handleAxiosUnAuthorized() {
        if (this._refreshToken === null) {
            return null;
        }
        const provider = AuthProviderFactory.providerStore()
        let result: string | GithubAuthProviderResponse = await provider["github"].refreshToken(this._refreshToken)

        if (typeof result === "string") {
            AuthProviderFactory.authSessions()["github"] = result
            result = helpers.QueryToObject(result) as GithubAuthProviderResponse
        }
        this._accessToken = result.access_token;
        this._refreshToken = result.refresh_token;
        return this;
    }
    async installations() {
        try {
           
            const response = await axios.get("https://api.github.com/user/installations", {
                headers: {
                    Authorization: `Bearer ${this._accessToken}`,
                    "X-GitHub-Api-Version": "2022-11-28",
                    "Accept": "application/vnd.github+json",
                },
            });

            return response.data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
    async cloneRepository(repo: string) {
        try {
            const { stderr, stdout } = await SystemOperations.executeCommand(`git clone https://x-access-token:<token>@github.com/repo`)

        } catch (error) {
            return error
        }
    }
    async fetchRepos(accessToken: string) {
        try {

            const response = await axios.get("https://api.github.com/user/repos?page=1&per_page=100", {
                headers: { Authorization: `Bearer ${this._accessToken}` },
            });

            return response.data
                .map((repo: any) => ({
                    id: repo.id,
                    name: repo.name,
                    full_name: repo.full_name,
                    private: repo.private,
                }));

        } catch (error) {
            throw error;
        }
    }
    async createSelectedRepoWebhook(repo: string, owner: string, accessToken: string) {
        try {


            const response = await axios.post<SelectedRepoWebhookResponse>(
                `https://api.github.com/repos/${owner}/${repo}/hooks`,
                {
                    data: {
                        name: "web",
                        active: true,
                        events: ["push", "pull_request"],
                        config: {
                            url: "https://example.com/webhook/github",
                            content_type: "json",
                            insecure_ssl: "0",
                        },
                    },
                    headers: {
                        accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                        Authorization: `Bearer ${this._accessToken}`,
                    },
                }
            );


            return response.data
        } catch (error) {
            throw error;
        }
    }
    async getAllRepositoriesHoooks(repo: string, owner: string, accessToken: string) {

        try {

            const response = await axios.get<AllRepositorieshooks>(
                `https://api.github.com/repos/${owner}/${repo}/hooks`, {

                headers: {
                    accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
            );


            return response.data
        } catch (error) {
            throw error;
        }
    }
}

export default new GithubService();
