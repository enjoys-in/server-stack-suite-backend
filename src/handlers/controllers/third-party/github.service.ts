import axios from "axios";
import { AllRepositorieshooks, SelectedRepoWebhookResponse } from "./interface";

class GithubService {
    async fetchRepos(accessToken: string) {
        try {

            const response = await axios.get("https://api.github.com/user/repos", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            return response.data.map((repo: any) => ({
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
                        Authorization: `Bearer ${accessToken}`,
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
