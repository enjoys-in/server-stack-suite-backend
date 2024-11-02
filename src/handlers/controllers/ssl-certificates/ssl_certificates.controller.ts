import type { Request, Response } from "express";
import { CreateSslCertificateDto } from "./dto/create-ssl_certificate.dto";
import { SslCertificatesService } from "./ssl_certificates.service";
import { SERVER_TYPES } from "@/utils/interfaces";
import { HostsService } from "../hosts/host.service";
import { COMMANDS } from "@/utils/paths";
import { AppEvents } from "@/utils/services/Events";
import { EVENT_CONSTANTS } from "@/utils/helpers/events.constants";
import { HOST_TYPE, IUser } from "@/utils/interfaces/user.interface";
import { OnEvent } from "@/utils/decorators";
import { UserEntity } from "@/factory/entities/users.entity";
import { UpdateSslCertificateDto } from "./dto/update-ssl_certificate.dto";

const  sslCertificatesService = new SslCertificatesService()
const hostsService = new HostsService();
class SslCertificatesController {
   

    constructor() {
      

    }
    async findAll(req: Request, res: Response) {        
        try {
            res.json({    success: true,
                message: "Certificates Fetched Successfully",
                result: await sslCertificatesService.findAll()});

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async create(req: Request, res: Response) {
        try {
            const user = req.user as IUser

            let { server_name } = req.params as { server_name: SERVER_TYPES };
            const createSslCertificateDto = req.body as CreateSslCertificateDto
            if (server_name !== "nginx") {
                throw new Error("Only Nginx is supported for now")
            }
            if ((await sslCertificatesService.findOneByDomain(createSslCertificateDto.host.primary_doman))) {
                throw new Error("SSL Certificate already created for " + createSslCertificateDto.host.primary_doman)
            }
            const host = await sslCertificatesService.findOne(Number(createSslCertificateDto.host.id))

            if (!host) {
                throw new Error("Host not found")
            }

            const prepareCMD = COMMANDS.SSL.GENERATE.replace("{server}", server_name).replace("{domain}", createSslCertificateDto.host.domains.join(" -d "))
            // this.systemOperations.run()

            AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, prepareCMD);
            createSslCertificateDto.ssl_certificates = {
                pk_key: `/etc/nginx/ssl/live/${createSslCertificateDto.host.primary_doman}/fullchain`,
                cert_key: `/etc/nginx/ssl/live/${createSslCertificateDto.host.primary_doman}/privkey`,
            }
            const userInstance = new UserEntity()
            userInstance.id = user.uid
            const data = await sslCertificatesService.create({
                ...createSslCertificateDto,
                user: userInstance
            });
            res.json({
                success: true,
                message: "SSL Certificate Created for " + createSslCertificateDto.host.primary_doman,
                result: data
            });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    @OnEvent("create_auto_ssl")
    private async createAutoSSL(payload:UpdateSslCertificateDto) {
        try {
            await sslCertificatesService.create(payload);
          } catch (error:any) {
            AppEvents.emit(EVENT_CONSTANTS.LOGS.ERROR, error.message);
          }
    }
    async findOne(req: Request, res: Response) {
        try {
            
            res.json({ message: "OK", result: sslCertificatesService.findOne(+req.params.id!), success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async delete(req: Request, res: Response) {
        try {
            res.json({ message: "OK", result: sslCertificatesService.remove(+req.params.id!), success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }



}
export default new SslCertificatesController()