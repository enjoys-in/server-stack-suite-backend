import { ActiveServicesEntity } from "@/factory/entities/active_services.enitity";
import { InjectRepository } from "@/factory/typeorm";
import type { Request, Response } from "express";
import containersService from "../containers/containers.service";
import { SERVER_DATA } from "@/utils/libs/data";
import { AppEvents } from "@/utils/services/Events";
import { OnEvent } from "@/utils/decorators";
import deploymentService from "../application/deployment.service";
import { ServicesData } from "@/utils/interfaces/deployment.interface";
import { ServiceDataEntity } from "@/factory/entities/service-data.entity";
import { ServicesEntity } from "@/factory/entities/services.entity";

const DEFAULT_SERVICES = SERVER_DATA.DEFAULT_SERVICES
const active_servicesRepository = InjectRepository(ActiveServicesEntity)
const service_dataRepository = InjectRepository(ServiceDataEntity)
const servicesRepository = InjectRepository(ServicesEntity)
let abortControllerStore: Record<string, AbortController> = {}
class ServiceController {
    async availableServices(req: Request, res: Response) {
        try {
            const result = await servicesRepository.find({
                relations: ["is_active_service"],
                select: {
                    id: true,
                    service_id: true,
                    service_name: true,
                    service_slug: true,
                    service_type: true,
                    image_name: true,
                    service_description: true,                    
                    auth_required: true,
                    service_status: true,
                    is_active_service: {
                        id: true,
                        service_slug: true,
                        container_id: true, 
                    }
                }
            })
            res.json({ message: "OK", result, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async getServices(req: Request, res: Response) {
        try {
            const uid = req.user!.uid;
            const userSvc = await active_servicesRepository.find({
                where: {
                    user: {
                        id: +uid
                    }
                },
                select: ["id", "service_slug", "started_at", "stopped_at", "status", "service_metadata", "container_id"]
            })
            res.json({ message: "OK", result: userSvc, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async getSingleServices(req: Request, res: Response) {
        try {
            const uid = req.user!.uid;
            const id = req.params.id
            const userSvcDetails = await active_servicesRepository.findOne({
                where: {
                    user: {
                        id: +uid
                    },
                    id: +id
                },
                select: ["id", "service_slug", "started_at", "stopped_at", "status", "service_metadata", "container_id", "created_at", "credentials"],
                relations: {
                    data: true
                }

            })
            if (!userSvcDetails) {
                throw new Error(`Service not found`)
            }
            res.json({ message: "OK", result: userSvcDetails, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async applyNewService(req: Request, res: Response) {
        try {
            const uid = req.user!.uid;
            const { service_slug, credential } = req.body as {
                service_slug: keyof typeof DEFAULT_SERVICES
                credential: {
                    username: string,
                    password: string
                }
            }

            if (!DEFAULT_SERVICES[service_slug]) {
                throw new Error("Service not found: ")
            }
            await active_servicesRepository.find({
                where: {
                    user: {
                        id: +uid
                    },
                    service_slug
                }
            })
            const service_metadata = DEFAULT_SERVICES[service_slug as keyof typeof DEFAULT_SERVICES] as ServicesData
            const data = await active_servicesRepository.save({
                service_slug,
                user: { id: +uid },
                service_metadata,
                credentials: credential
            })
            if (service_metadata.serviceType === "Database") {
                await service_dataRepository.save({
                    active_services: { id: data.id },
                    users: [credential],
                })
            }
            await servicesRepository.save({ is_active_service: { id: data.id }, })
            AppEvents.emit("deploy::service", JSON.stringify(data))
            res.json({ message: "OK", result: null, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async deleteService(req: Request, res: Response) {
        try {
            const uid = req.user!.uid;
            const { service_slug, delete_image } = req.body as { delete_image: boolean, service_slug: keyof typeof DEFAULT_SERVICES };
            if (!DEFAULT_SERVICES[service_slug]) {
                throw new Error("Service not found")
            }
            const active_service = await active_servicesRepository.findOne({
                where: {
                    user: {
                        id: +uid
                    },
                    service_slug
                }
            })
            if (!active_service) {
                throw new Error("Service not found")
            }
            await containersService.removeContainer(active_service.container_id)
            if (delete_image) {
                await containersService.removeDockerImage(DEFAULT_SERVICES[service_slug].imageName)
            }
            await active_servicesRepository.remove(active_service)

            res.json({ message: "OK", result: null, success: true }).end();
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async changeServiceState(req: Request, res: Response) {
        try {
            const uid = req.user!.uid;

            const container_id = req.params.container_id
            const { status } = req.body
            if (status === 'RUNNING') {
                await containersService.stopContainer(container_id)
            }
            await containersService.startContainer(container_id)

            await active_servicesRepository.update({
                user: {
                    id: +uid
                },
                container_id
            }, {
                status: status
            })
            res.json({ message: "OK", result: null, success: true }).end();
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async createData(req: Request, res: Response) {
        try {
            const { service_id, type, service_type, info, container_id } = req.body as {
                service_id: number,
                service_type: "database",
                container_id: string,
            } & ({
                type: "user"
                info: {
                    username: string;
                    password: string;
                }
            } | {
                type: "database"
                info: {
                    name: string;
                    owner: string
                }
            })
            if (service_type !== "database") {
                throw new Error("Service type not supported")
            }
            const containerAbortController = new AbortController()
            abortControllerStore = { [container_id]: containerAbortController }
            let option = {}
            let config: any = {
                abortSignal: containerAbortController.signal
            }
            switch (type) {
                case "database":
                    option = { databases: () => `databases || '[${JSON.stringify(info)}]'::jsonb`, }
                    const sqlQuery = `CREATE DATABASE ${info.name};
                    GRANT ALL PRIVILEGES ON DATABASE ${info.name} TO ${info.owner};`
                    config = {
                        Cmd: [
                            'psql',
                            '-U',
                            'postgres',
                            '-c',
                            sqlQuery
                        ],
                        AttachStdout: true,
                        AttachStderr: true
                    }
                    break;
                case "user":
                    option = { users: () => `users || '[${JSON.stringify(info)}]'::jsonb`, }
                    config = {
                        Cmd: [
                            'psql',
                            '-U',
                            'postgres',
                            '-c',
                            `CREATE USER ${info.username} WITH PASSWORD '${info.password}';`
                        ],
                        AttachStdout: true,
                        AttachStderr: true
                    }
                    break;
                default:
                    throw new Error("Service type not supported")
            }


            const container = containersService.getContainer(container_id)
            await container.exec({
                Cmd: [
                    'psql',
                    '-U',
                    'postgres',
                    '-c',
                    `CREATE USER mullayam WITH PASSWORD 'mullayam';`
                ]
            })

            // await service_dataRepository.createQueryBuilder()
            // .update(ServiceDataEntity)
            // .set(option)
            // .where("id = :id", { id: service_id })
            // .execute();

            res.json({ message: "Added Successfully", result: null, success: true }).end();
            delete abortControllerStore[container_id]
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async deleteData(req: Request, res: Response) {
        try {
            const { service_data_id, service_type, key, type, container_id } = req.body as {
                service_data_id: number,
                service_type: "database",
                type: "user" | "database"
                key: "database",
                container_id: string,

            }
            if (service_type !== "database") {
                throw new Error("Service type not supported")
            }
            const containerAbortController = new AbortController()
            abortControllerStore = { [container_id]: containerAbortController }
            let option = {}
            let config: any = {
                abortSignal: containerAbortController.signal
            }
            switch (type) {
                case "database":
                    option = { databases: () => `(SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb) FROM jsonb_array_elements(COALESCE(databases, '[]'::jsonb)) elem WHERE elem->>'name' != '${key}')`, }

                    config = {

                        Cmd: [
                            'psql',
                            '-U',
                            'postgres', // Replace with the admin user
                            '-c',
                            `DROP DATABASE IF EXISTS ${key}';`
                        ],
                        AttachStdout: true,
                        AttachStderr: true
                    }
                    break;
                case "user":
                    option = { users: () => `(SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb) FROM jsonb_array_elements(COALESCE(users, '[]'::jsonb)) elem WHERE elem->>'username' != '${key}')`, }
                    const sqlQuery = `
                    REVOKE ALL PRIVILEGES ON DATABASE your_database_name FROM ${key};
                    REVOKE ALL PRIVILEGES ON SCHEMA public FROM ${key};
                    REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ${key};                 
                   
                    
                    DROP USER IF EXISTS ${key};
                    `;
                    config = {

                        Cmd: [
                            'psql',
                            '-U',
                            'postgres', // Replace with the admin user
                            '-c',
                            sqlQuery
                        ],
                        AttachStdout: true,
                        AttachStderr: true
                    }
                    break;
                default:
                    throw new Error("Service type not supported")
            }

            const container = containersService.getContainer(container_id)
            await container.exec(config)
            await service_dataRepository.createQueryBuilder()
                .update(ServiceDataEntity)
                .set(option)
                .where("id = :id", { id: service_data_id })
                .execute();
            res.json({ message: "Deleted Successfully", result: null, success: true }).end();
            delete abortControllerStore[container_id]

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async connectService(req: Request, res: Response) {

        try {
            const service_id = req.params.service_id

            const service = await active_servicesRepository.findOne({
                where: {
                    id: +service_id
                },
                select: ["service_metadata", "credentials"]
            })
            if (!service) {
                throw new Error("Service not found")
            }
            const dialect = service.service_metadata.serviceSlug
            const serviceURI = `${dialect}://${service.credentials.username}:${service.credentials.password}@localhost:${service.service_metadata.servicePort[0]}`

            res.json({ message: "OK", result: "Operation aborted", success: true }).end();
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async abortOperation(req: Request, res: Response) {
        try {
            const container_id = req.params.container_id

            const containerAbortController = abortControllerStore[container_id as string]
            if (containerAbortController) {
                containerAbortController.abort()
                delete abortControllerStore[container_id]
            }
            res.json({ message: "OK", result: "Operation aborted", success: true }).end();
        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    @OnEvent("deploy::service")
    private deployService(payload: string) {
        deploymentService.deployNewService(payload)
    }
}

export default new ServiceController()