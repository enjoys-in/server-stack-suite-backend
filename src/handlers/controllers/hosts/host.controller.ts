
import { HOST_TYPE } from "@/utils/types/user.interface";
import type { Request, Response } from "express";
import { HostsService } from "./host.service";
import { SERVER_TYPES } from "@/utils/types";
import { AppEvents } from "@/utils/services/Events";
import { EVENT_CONSTANTS } from "@/utils/helpers/events.constants";
import { COMMANDS, CRUD, PATHS, SERVER_TYPE_FILE_PATH } from "@/utils/paths";
import { FileOperations } from "@/handlers/providers/io-operations";
import path from "path";
import { mkdirSync, writeFile } from "fs";
import { CreateErrorPageDto, CreateHostDto } from "./dto/create-host.dto";
import { NginxSample } from "@/utils/libs/samples/ngnix/demo";
import { CreateSslCertificateDto } from "../ssl-certificates/dto/create-ssl_certificate.dto";

const fileOperations = new FileOperations()
const hostsService = new HostsService();

class HostController {


    /* REDIRECTION HOSTS */

    /* PROXY HOSTS */


    async getAllHosts(req: Request, res: Response) {
        try {
            let { host_type, fields } = req.query as { host_type: HOST_TYPE, fields: string };
            let { server_name } = req.params as { server_name: SERVER_TYPES };
            if (!server_name) {
                throw new Error("Server name is required")
            }

            if (!(host_type!.toUpperCase() in HOST_TYPE)) {
                throw new Error("Host type not found, Invalid Host")
            }
            if (!fields) {
                fields = "*"
            }

            res.json({ message: "All Hosts Fetched", result: await hostsService.findAll(server_name!, host_type!, fields), success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async getSingleHost(req: Request, res: Response) {
        try {
            let { server_name, domain_name } = req.params as { server_name: SERVER_TYPES, domain_name: string };
            res.json({ message: "OK", result: await hostsService.findOneByDomainName(domain_name, server_name), success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    async addNewHosts(req: Request, res: Response) {
        try {
            let { server_name } = req.params as { server_name: SERVER_TYPES };

            if (server_name !== "nginx") {
                throw new Error("Only Nginx is supported for now")
            }
            const server_nameUpdated = server_name.toUpperCase() as Uppercase<SERVER_TYPES>
            const createHostDto = req.body as CreateHostDto
            if (await hostsService.findOneByDomainName(createHostDto.domain_name, server_name)) {
                throw new Error("Proxy Host already exist with this domain name, Please Update it")
            }
            // check if path starts with / or not
            createHostDto.path = createHostDto.path.startsWith("/") ? createHostDto.path : "/" + createHostDto.path
            // set host type to proxy
            createHostDto.host_type = HOST_TYPE.PROXY
            // create host
            AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Preparing Host  ${createHostDto.domain_name}`,);
            const hostInstance = await hostsService.create(createHostDto)
            if (hostInstance) {
                //create domain string[]
                const server_names = createHostDto.domains.map((domain) => domain.source)
                const filePath = SERVER_TYPE_FILE_PATH[server_nameUpdated as keyof typeof SERVER_TYPE_FILE_PATH].SITES_AVAILABLE_LOCATION_FILE.replace(":file_name", createHostDto.domain_name)
                let fileContent = NginxSample.DeployApi(server_names, createHostDto.destination, createHostDto.path)
                // write to file in path
                AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Writing Config File  ${createHostDto.domain_name}`);
                if (createHostDto.ip_whitelist) {
                    AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `WhiteListing Ips ${createHostDto.allowed_ips}`,);
                    fileContent = fileContent.replace("# allow ips", createHostDto.allowed_ips);
                    fileContent = fileContent.replace("# deny  all", "deny  all");
                }
                if (createHostDto.has_custom_headers) {
                    AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Adding Custom Header ${createHostDto.domain_name} `,);
                    const headers = createHostDto.custom_headers.map((item) => {
                        return `add_header ${item.name} "${item.value}";`
                    })
                    fileContent = fileContent.replace("# {custom_headers}", headers.join("\n"));
                }

                fileOperations.writeFile(filePath, fileContent)

                // send  event to create ssl certificate if auto_ssl is true
                if (createHostDto.auto_ssl) {
                    AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Installing SSL ${createHostDto.domain_name} `,);
                    const prepareCMD = COMMANDS.SSL.GENERATE.replace("{server}", server_name).replace("{domain}", server_names.join(" -d "))
                    const createSslCertificateDto: CreateSslCertificateDto = {
                        provider: 'Lets Encrpyt',
                        host: {
                            id: 1,
                            primary_doman: createHostDto.domain_name,
                            domains: server_names
                        },
                        ssl_certificates: {
                            pk_key: PATHS.SSL_CERTIFICATES.LETS_ENCRYPT.pk_key.replace(":domain", createHostDto.domain_name),
                            cert_key: PATHS.SSL_CERTIFICATES.LETS_ENCRYPT.cert_key.replace(":domain", createHostDto.domain_name),
                        }
                    }

                    AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `SSL Installed Successfully`,);
                    AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `
                    Private Key: ${createSslCertificateDto.ssl_certificates.pk_key}
                    Certificate: ${createSslCertificateDto.ssl_certificates.cert_key}
                    `);
                    AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, prepareCMD);
                }

                // send  event to show logs and reload nginx and restart nginx 
                AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Host Created ${createHostDto.domain_name} \n ${fileContent}`,);

                res.json({ message: "OK", result: null, success: true });

            }
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async deleteHost(req: Request, res: Response) {
        try {
            let { server_name, domain_name } = req.params as { server_name: SERVER_TYPES, domain_name: string };

            if (server_name !== "nginx") {
                throw new Error("Only Nginx is supported for now")
            }
            if (!domain_name) {
                throw new Error("Invalid Domain")
            }
            AppEvents.emit(
                EVENT_CONSTANTS.LOGS.WARN,
                `Deleting Proxy Host `
            );
            const server_nameUpdated = server_name.toUpperCase() as Uppercase<SERVER_TYPES>

            await hostsService.deleteHost(domain_name)
            const filePath = SERVER_TYPE_FILE_PATH[server_nameUpdated as keyof typeof SERVER_TYPE_FILE_PATH].SITES_AVAILABLE_LOCATION_FILE.replace(":file_name", domain_name)
            if (fileOperations.checkFileExists(filePath)) {
                fileOperations.deleteFile(filePath)
            }

            AppEvents.emit(
                EVENT_CONSTANTS.LOGS.INFO,
                `Host ${domain_name} Deleted \n`,
            );
            res.json({ message: `Host ${domain_name} Deleted \n`, result: {}, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async updateHost(req: Request, res: Response) {
        try {
            let { server_name, domain_name } = req.params as { server_name: SERVER_TYPES, domain_name: string };


            if (server_name !== "nginx") {
                throw new Error("Only Nginx is supported for now")
            }
            if (!domain_name) {
                throw new Error("Domain name is required")
            }
            const createHostDto = req.body as CreateHostDto

            if (!(await hostsService.findOneByDomainName(createHostDto.domain_name, server_name))) {
                throw new Error("Proxy Host already does not found")
            }
            const server_nameUpdated = server_name.toUpperCase() as Uppercase<SERVER_TYPES>

            // check if path starts with / or not
            createHostDto.path = createHostDto.path.startsWith("/") ? createHostDto.path : "/" + createHostDto.path
            // set host type to proxy
            createHostDto.host_type = HOST_TYPE.PROXY
            // create host
            AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Updating Host  ${createHostDto.domain_name}`,);

            //create domain string[]
            const server_names = createHostDto.domains.map((domain) => domain.source)
            const filePath = SERVER_TYPE_FILE_PATH[server_nameUpdated as keyof typeof SERVER_TYPE_FILE_PATH].SITES_AVAILABLE_LOCATION_FILE.replace(":file_name", createHostDto.domain_name)
            let fileContent = NginxSample.DeployApi(server_names, createHostDto.destination, createHostDto.path)
            // write to file in path
            AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Writing Config File  ${createHostDto.domain_name}`);
            if (createHostDto.ip_whitelist) {
                AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `WhiteListing Ips ${createHostDto.allowed_ips}`,);
                fileContent = fileContent.replace("# allow ips", createHostDto.allowed_ips);
                fileContent = fileContent.replace("# deny  all", "deny  all");
            }
            if (createHostDto.has_custom_headers) {
                AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Adding Custom Header ${createHostDto.domain_name} `,);
                const headers = createHostDto.custom_headers.map((item) => {
                    return `add_header ${item.name} "${item.value}";`
                })
                fileContent = fileContent.replace("# {custom_headers}", headers.join("\n"));
            }

            fileOperations.writeFile(filePath, fileContent)

            // send  event to create ssl certificate if auto_ssl is true
            if (createHostDto.auto_ssl) {
                AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Installing SSL ${createHostDto.domain_name} `,);
                const prepareCMD = COMMANDS.SSL.GENERATE.replace("{server}", server_name).replace("{domain}", server_names.join(" -d "))
                const createSslCertificateDto: CreateSslCertificateDto = {
                    provider: 'Lets Encrpyt',
                    host: {
                        id: 1,
                        primary_doman: createHostDto.domain_name,
                        domains: server_names
                    },
                    ssl_certificates: {
                        pk_key: PATHS.SSL_CERTIFICATES.LETS_ENCRYPT.pk_key.replace(":domain", createHostDto.domain_name),
                        cert_key: PATHS.SSL_CERTIFICATES.LETS_ENCRYPT.cert_key.replace(":domain", createHostDto.domain_name),
                    }
                }

                AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `SSL Installed Successfully`,);
                AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `
                  Private Key: ${createSslCertificateDto.ssl_certificates.pk_key}
                  Certificate: ${createSslCertificateDto.ssl_certificates.cert_key}
                  `);
                AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, prepareCMD);
            }

            // send  event to show logs and reload nginx and restart nginx 
            AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Host Created ${createHostDto.domain_name} \n ${fileContent}`,);


            res.json({ message: "Proxy Host Created", result: createHostDto, success: true });

        }
        catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    /* ERROR PAGE   */
    async AddNewErrorPage(req: Request, res: Response) {
        try {
            let { server_name } = req.params as { server_name: SERVER_TYPES };

            if (server_name !== "nginx") {
                throw new Error("Only Nginx is supported for now")
            }
            const createErrorPageDto = req.body as CreateErrorPageDto
            await hostsService.createErrorPage(createErrorPageDto)
            const filePath = CreateErrorPageDto.name === "default" ?
                PATHS.NGINX.ERROR_PAGES.replace(":{file_name}", createErrorPageDto.name)
                :
                PATHS.NGINX.ERROR_PAGES.replace("custom_{file_name}", "index")

            AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, { filePath, content: createErrorPageDto.content })

            res.json({ message: "Error Page has been Created", result: {}, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async getAllErrorPage(req: Request, res: Response) {
        try {

            res.json({ message: "OK", result: await hostsService.getAllErrorPages(), success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async getOneErrorPage(req: Request, res: Response) {
        try {
            const id = req.query.id
            res.json({ message: "OK", result: await hostsService.getSingleErrorPage(+id!), success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async deleteErrorPage(req: Request, res: Response) {
        try {

            res.json({ message: "Error Page has Been Deleted ", result: await hostsService.deleteErrorPage(+req.body.id), success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    async updateErrorPage(req: Request, res: Response) {
        try {
            let { server_name } = req.params as { server_name: SERVER_TYPES };

            if (server_name !== "nginx") {
                throw new Error("Only Nginx is supported for now")
            }
            const server_nameUpdated = server_name.toUpperCase() as Uppercase<SERVER_TYPES>

            const { id, ...rest } = req.body
            AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, "Updating Error Page")
            await hostsService.updateErrorPage(+id, { content: rest.content, status: rest.status })

            const indexHtmlFile = SERVER_TYPE_FILE_PATH[server_nameUpdated as keyof typeof SERVER_TYPE_FILE_PATH].INDEX_HTML
            AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, CRUD.DELETE.FILE.replace("{path}", indexHtmlFile));
            const filePath = path.join("/home/mullayam", indexHtmlFile);
            mkdirSync(path.dirname(filePath), { recursive: true });

            AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, server_name.toUpperCase());

            writeFile(filePath, req.body.content, (err) => {
                if (err) {
                    AppEvents.emit(EVENT_CONSTANTS.LOGS.ERROR, "Error writing at " + indexHtmlFile);
                    throw new Error("Unable to write data to  File")

                } else {
                    AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, CRUD.DELETE.FILE.replace("{path}", indexHtmlFile));
                }
            });

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
export default new HostController()