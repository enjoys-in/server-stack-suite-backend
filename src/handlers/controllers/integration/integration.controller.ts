import { type Request, type Response } from "express";
import { AuthProviderFactory } from "@/app/modules/oauth2/oauth2factory";
import githubService from "../third-party/github.service";
import { AuthProvidersList, GithubAuthProviderResponse, RepoProvidersList } from "@/utils/interfaces/providers.interfac";
import integrationService from "./integration.service";
import { CreateIntegrationDto, CreateIntegrationDto2 } from "./dto/createIntegration.dto";
import { IUser } from "@/utils/interfaces/user.interface";
import { Security } from "@/utils/helpers/security";
import { CONFIG } from "@/app/config";
import helpers from "@/utils/helpers";
import { PublicRoute } from "@/utils/decorators";
const _store = AuthProviderFactory.providerStore()
const _sessions = AuthProviderFactory.authSessions();

const security = new Security()
const { DecryptFromString } = security.EncryptDecryptData()

const tempUserStore: any = {}

class IntegrationController {


    async createApp(req: Request, res: Response) {
        try {
            const body = req.body as CreateIntegrationDto | CreateIntegrationDto2
            await integrationService.create(body, req.user!.uid)
            res.json({ message: "OK", result: {}, success: true });
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async getApp(req: Request, res: Response) {
        try {
            let providerName = req.params.provider as AuthProvidersList
            if (!providerName) {
                throw new Error("Provider not found")
            }
            let response
            const providerUpperCase = providerName.toUpperCase()
            if (req.query && req.query.fields === "all") {
                response = await integrationService.findAllAppByProvider(req.user!.uid, providerUpperCase, ["id", "is_active", "provider"])
            } else {
                response = await integrationService.findAppByProvider(req.user!.uid, providerUpperCase, ["id", "is_active", "name", "access_type", "provider"])
            }


            res.json({ message: "OK", result: response, success: true });
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async deleteApp(req: Request, res: Response) {
        try {
            const id = req.params.id as string
            await integrationService.delete(parseInt(id))
            res.json({ message: "OK", result: {}, success: true });
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }


    async providerAuth(req: Request, res: Response) {
        try {
            const user = req.user as IUser
            let providerName = req.params.provider as AuthProvidersList
            if (!providerName) {
                throw new Error("Provider not found")
            }
            if (_store[providerName]) {
                res.redirect("/api/v1/oauth2/github/callback")
                return
            }
            const providerUpperCase = providerName.toUpperCase()

            const app = await integrationService.findAppByProvider(user.uid, providerUpperCase)
            if (!app) {
                throw new Error("App not found")
            }
            const { client_id, client_secret, redirect_url } = app.metadata
            const provider = AuthProviderFactory.createProvider(
                providerName,
                DecryptFromString(client_id!, CONFIG.SECRETS.APP_SECRET),
                DecryptFromString(client_secret!, CONFIG.SECRETS.APP_SECRET),
                DecryptFromString(redirect_url!, CONFIG.SECRETS.APP_SECRET)
            )

            _store[providerName] = provider
            const redirect_uri = provider.getAuthUrl()

            res.json({ message: "OK", result: { redirect_url: redirect_uri }, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    @PublicRoute()
    async providerCallback(req: Request, res: Response) {
        try {
            const providerName = req.params.provider as AuthProvidersList

            if (!providerName) {
                throw new Error("Provider not found")
            }
            if (_sessions[providerName]) {
                res.json({ message: "OK", result: helpers.QueryToObject(_sessions[providerName]), success: true }).end()
                return
            }

            if (!req.query.code) {
                throw new Error("Missing code parameter")
            }
            const code = req.query.code as string
            if (!_store[providerName]) {
                throw new Error("Invalid Request")
            }
            const result = await _store[providerName].handleCallback(code);
            let responseCallback: Partial<GithubAuthProviderResponse> = {}
            _sessions[providerName] = result as string
            if (typeof result === "string") {
                responseCallback = helpers.QueryToObject(result)
            }
            githubService.setCredentials(responseCallback.access_token as string, responseCallback.refresh_token as string)
            res.json({ message: "OK", result: responseCallback, success: true })
            AuthProviderFactory.setSession()
            res.end()

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    @PublicRoute()
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

    async allRepositories(req: Request, res: Response) {
        try {
            const provider = req.params.provider as RepoProvidersList
            const isExist = _store[provider]
            // if (!isExist) {
            //     throw new Error("Provider not found")                 
            // }
            let repoList: any[] = [];
            switch (provider) {
                case "gitlab":
                    throw new Error("GitLab integration not implemented")

                case "bitbucket":
                    throw new Error("Bitbucket integration not implemented")

                case "github":
                    repoList = await githubService.fetchRepos()
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
    async createSelectedRepoWebhook(req: Request, res: Response) {
        try {
            const provider = req.params.provider as RepoProvidersList
            const accessToken = _sessions[provider]

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
const integrationController = new IntegrationController()
export default integrationController