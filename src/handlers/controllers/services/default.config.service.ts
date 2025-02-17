import { DockerServiceImages } from "@/utils/interfaces/deployment.interface";
import { SERVER_DATA } from "@/utils/libs/data";
import { HOME_DIR } from "@/utils/paths";
import path from "path";
const svc = SERVER_DATA.DEFAULT_SERVICES
type ServiceData = {
    serviceId: number;
    serviceName: string;
    serviceSlug: string;
    imageName: string;
    serviceDescription: string;
    serviceType: string;
    servicePort: string[];
    serviceStatus: boolean;
    auth_required: boolean;
};

type Config = {
    Image: string;
    name: string;
    Env: string[];
    ExposedPorts: Record<string, {}>;
    HostConfig: {
        PortBindings: Record<string, { HostPort: string }[]>;
        Binds?: string[];
        RestartPolicy: {
            Name: string;
        };
    };
};

class DefaultServiceProvider {
    createContainerConfig(type: DockerServiceImages, credentials: any) {
        let containerConfig: null | any = null;
        switch (type) {
            case "postgres:latest":

                containerConfig = this.createPostgresContainerConfig(
                    credentials.username,
                    credentials.password
                );
                break;
            case "mysql:latest":
                containerConfig = this.createMySql(
                    credentials.username,
                    credentials.password
                );
                break;
            case "mongo:latest":
                containerConfig = this.createMongoConfig(
                    credentials.username,
                    credentials.password
                );
                break;
            case "redis:latest":
                containerConfig = this.createRedisConfig(credentials.username,
                    credentials.password)
                break;
            case "stalwartlabs/mail-server:latest":
                containerConfig = this.createMailContainerConfig()
                break;

            default:
                throw new Error(`Unsupported application type:`);
        }
        return containerConfig;
    }
    generateConfig(service: ServiceData, volumeToBind: string[], Env: string[]): Config {
        const exposedPorts = service.servicePort.reduce((acc, port) => {
            acc[`${port}/tcp`] = {};
            return acc;
        }, {} as Record<string, {}>);

        const portBindings = service.servicePort.reduce((acc, port) => {
            acc[`${port}/tcp`] = [{ HostPort: port }];
            return acc;
        }, {} as Record<string, { HostPort: string }[]>);

        return {
            Image: service.imageName,
            name: service.serviceSlug,
            ExposedPorts: exposedPorts,
            Env,
            HostConfig: {
                PortBindings: portBindings,
                Binds: volumeToBind,
                RestartPolicy: {
                    Name: "always",
                },
            },
        };
    };
    private createMailContainerConfig() {

        return this.generateConfig(svc["mail-server"], [], []);
    }
    private createPostgresContainerConfig(username: string, password: string) {
        return this.generateConfig(svc.postgres, [
            `${path.join(
                HOME_DIR,
                ".data",
                "pgsql-data"
            )}:/var/lib/postgresql/data`,
        ], [
            `POSTGRES_PASSWORD=${password}`,
            `POSTGRES_USER=${username}`,
            `POSTGRES_DB=defaultdb`,
        ],)
    }
    private createMySql(username: string, password: string) {
        return this.generateConfig(svc.mysql, [
            `${path.join(HOME_DIR, ".data", "mysql-data")}:/var/lib/mysql/data`,
        ], [
            `MYSQL_ROOT_PASSWORD=${password}`,
            `MYSQL_USER=${username}`,
            `MYSQL_PASSWORD=${password}`,
            `MYSQL_DATABASE=defaultdb`,
        ])

    }
    private createRedisConfig(username: string, password: string) {
        const redisConfig = this.generateConfig(svc.redis, [`${path.join(HOME_DIR, ".data", "redis_data")}:/redis_data`], [
            `REDIS_PASSWORD=${password}`,
            `REDIS_USER=${username}`,
        ])
        return {
            ...redisConfig,
            Cmd: [
                "redis-server",
                "--user",
                username,
                "--requirepass",
                password,
                "--protected-mode",
                "yes",
            ],
        };
    }
    private createMongoConfig(username: string, password: string) {
        return this.generateConfig(svc.mongodb, [`${path.join(HOME_DIR, ".data", "mongo-data")}:/var/lib/mongo/db`], [
            `MONGO_INITDB_ROOT_PASSWORD=${password}`,
            `MONGO_INITDB_ROOT_USERNAME=${username}`,
            `MONGO_INITDB_DATABASE=defaultdb`,
        ])
    };
    private createGiteaConfig() {
        return this.generateConfig(svc.gitea, [], [
            `GITEA_ROOT_URL=http://localhost:3000`,
            `GITEA_RUN_MODE=prod`,
            `GITEA_APP_NAME=Gitea`,
            `GITEA_CUSTOM_CONF=./conf/app.ini`,
            `GITEA_DB_TYPE=postgres`,
            `GITEA_DB_HOST=postgres`,
            `GITEA_DB_NAME=gitea`,
            `GITEA_DB_USER=postgres`,
            `GITEA_DB_PASSWD=your_postgres_password`,
            `GITEA_DB_PORT=5432`,
            `GITEA_CACHE_TYPE=memory`,
            `GITEA_CACHE_ADAPTER=redis`,
            `GITEA_CACHE_HOST=redis`,
            `GITEA_CACHE_PORT=6379`,
            `GITEA_SESSION_PROVIDER=memory`,
            `GITEA_SESSION_COOKIE_SECURE=true`,
            `GITEA_COOKIE_SECURE=true`,
            `GITEA_INSTALL_LOCK=true`,
            `GITEA_LOG_MODE=file`,]);
    }
    private createKafkaConfig() { }
    private createRabbitmqConfig() { }
    private createMinioConfig() { }

}

export default new DefaultServiceProvider();