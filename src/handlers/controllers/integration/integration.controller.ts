import type { Request, Response } from "express";
import { AuthProviderFactory } from "@/app/modules/oauth2/oauth2factory";
import { JwtAuth } from "@/middlewares/auth.Middleware";
import { Middleware } from "@/utils/decorators/middleware.decorator";
import githubService from "../third-party/github.service";
import { AuthProvidersList, RepoProvidersList } from "@/utils/interfaces/providers.interfac";


class IntegrationController {


    async providerAuth(req: Request, res: Response) {
        try {
            const providerName = req.params.provider as AuthProvidersList
            const authProvider = AuthProviderFactory.createProvider(providerName, "", "", "")
            res.json({ message: "OK", result: { authProvider }, success: true });
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    async providerCallback(req: Request, res: Response) {
        try {
            const providerName = req.params.provider as AuthProvidersList
            const { code } = req.query;
            const authProvider = AuthProviderFactory.createProvider(providerName, "", "", "")
            const result = await authProvider.handleCallback(code as string);

            res.json({ message: "OK", result: result, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    async providerWebhook(req: Request, res: Response) {
        try {
            res.json({ message: "OK", result: null, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    @Middleware(JwtAuth.validateUser)
    async allRepositories(req: Request, res: Response) {
        try {
            const accessToken = req.headers["x-github-access-token"] || "ghp_tXLux11RXZvMA7LPJpCOUVpWycoboV1Fnon";
            const provider = req.params.provider as RepoProvidersList
            let repoList: any[] = [];
            switch (provider) {
                case "gitlab":
                    throw new Error("GitLab integration not implemented")

                case "bitbucket":
                    throw new Error("Bitbucket integration not implemented")

                case "github":
                    repoList = await githubService.fetchRepos(String(accessToken))
                    break;

                default:
                    throw new Error("Unsupported repository provider")

            }

            res.json({ message: "OK", result: repoList, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    @Middleware(JwtAuth.validateUser)
    async createSelectedRepoWebhook(req: Request, res: Response) {
        try {
            const provider = req.params.provider as RepoProvidersList
            const accessToken = req.headers["x-github-access-token"] || "ghp_tXLux11RXZvMA7LPJpCOUVpWycoboV1Fnon";

            throw new Error("Method not supported")
            res.json({ message: "OK", result: null, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    @Middleware(JwtAuth.validateUser)
    async allRepositoriesHooks(req: Request, res: Response) {
        try {
            const provider = req.params.provider as RepoProvidersList
            const accessToken = req.headers["x-github-access-token"] || "ghp_tXLux11RXZvMA7LPJpCOUVpWycoboV1Fnon";

            throw new Error("Method not supported")

            res.json({ message: "OK", result: null, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }


}
export default new IntegrationController()