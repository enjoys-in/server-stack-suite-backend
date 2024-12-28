import * as path from "path";
import { exec, execFileSync, spawn } from "child_process";
import { InjectRepository } from "@/factory/typeorm";
import { WebhookService } from "@/handlers/providers/webhook.provider";
import { ApplicationEntity } from "@/factory/entities/application.entity";
import { LogsProvider } from "@/handlers/providers/logs.provider";
import { ApplicationDeploymentStatus, ContainerStatus, DeploymentState, DeploymentStatus, WebhookStatus } from "@/utils/interfaces/deployment.interface";
import { existsSync, readFileSync, writeFile, writeFileSync } from "fs";
import { COMMANDS, DEPLOYMENT_DIR } from "@/utils/paths";
import { CustomFunctions } from "@/handlers/providers/custom-functions";
import { DeploymentTrackerEntity } from "@/factory/entities/deploymen_tracker.entity";
import { SOCKET_EVENTS } from "@/utils/services/sockets/socketEventConstants";
import { SystemOperations } from "@/handlers/providers/system-operations";
import { FileOperations } from "@/handlers/providers/io-operations";
import simpleGit from "simple-git"
import helpers from "@/utils/helpers";
import containersService from "../containers/containers.service";
import { ContainerEntity } from "@/factory/entities/container.entity";
import { formatDate, LOG_DIR } from "@/utils/helpers/file-logs";
import { NixpackPlan } from "@/utils/interfaces/buidPacksPlan.interface";
import hbs from "handlebars";
import toml from 'toml'
import { uniqueNamesGenerator,Config,adjectives,animals ,colors,countries ,names,languages,starWars  } from 'unique-names-generator';
import { subdomainPortMap } from "@/middlewares/proxy.middleware";
import { CONFIG } from "@/app/config";
const config: Config = {
    separator: '-',
    seed: 120498,
    style:"lowerCase",
    dictionaries: [adjectives,animals ,colors,countries ,names,languages,starWars]
};


const git = simpleGit();
const func = new CustomFunctions()
const fileOperations = new FileOperations()
const appRepository = InjectRepository(ApplicationEntity)
const deploymentTrackerRepo = InjectRepository(DeploymentTrackerEntity)
const containerRepository = InjectRepository(ContainerEntity)

const logService = new LogsProvider()
const webhookService = new WebhookService()
const deploymentTracker: Record<string, DeploymentState> = {};
// https://hub.docker.com/v2/repositories/library/nginx/tags?page_size=1&page=1&ordering=last_updated&name=
class DepploymentService {
    async stopDeploy(applicationId: string) {
        const currentApp = deploymentTracker[`app::${applicationId}`]
        if (currentApp.status === "in-progress") {
            currentApp.abortController?.abort()
            deploymentTrackerRepo.update({ application: { id: +applicationId } }, { status: "cancelled" })
        }
    }
    async deployApplication(applicationId: string, socketId: string): Promise<void> {
        // Check if there's an ongoing deployment
        const trackerResult = await deploymentTrackerRepo.findOne({ where: { application: { id: +applicationId } } })

        if (deploymentTracker[`app::${trackerResult?.deployment_id}`]?.status === "in-progress") {
            logService.emitLog(socketId, trackerResult!.id, `Checking if there is another deployment is going...`, "info");
            logService.emitLog(socketId, trackerResult!.id, `Another deployment is in progress for application ${applicationId}`, "info");

            logService.emitLog(socketId, trackerResult!.id, `Cancelling current deployment for application ${applicationId}`, "warn");

            // Cancel the current deployment
            deploymentTracker[`app::${trackerResult!.deployment_id}`].abortController?.abort();
            deploymentTracker[`app::${trackerResult!.deployment_id}`].status = "cancelled";
            deploymentTrackerRepo.update({ id: trackerResult?.id }, { status: "cancelled" })
            logService.emitLog(socketId, trackerResult!.id, `Cancelled the current deployment for application ${applicationId}`, "warn");

        }
        // Initialize new deployment state
        const abortController = new AbortController();


        const deployment = await deploymentTrackerRepo.save({ deployment_id: helpers.SimpleHash(), application: { id: +applicationId }, started_at: new Date().toISOString(), status: DeploymentStatus.PENDING })
        logService.emitLog(socketId, deployment.id, `Initializing new deployment`, "info");


        deploymentTracker[`app::${deployment.deployment_id}`] = { status: "in-progress", abortController };

        const application = await appRepository.findOne({
            where: { id: +applicationId }, relations: ["project", "containers"], select: {
                project: {
                    id: true,
                    project_path: true
                }
            }
        });

        try {
            if (!application) throw new Error("Application not found");
            await this.simulateWork(deployment.deployment_id, abortController.signal);

            if (abortController.signal.aborted) throw new Error("Deployment cancelled, New Deployment is Requested");

            // Cancellation check during provisioning process
            // Trigger provisioning webhook
            await webhookService.triggerWebhook(application.id, WebhookStatus.PROVISIONING, {
                applicationId: application.id,
                status: "provisioning",
            });


            // Update application status            
            application.status = ApplicationDeploymentStatus.PROVISIONING;
            await appRepository.save(application);

            logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS, ApplicationDeploymentStatus.PROVISIONING)
            logService.emitLog(socketId, deployment.id, `Provisioning new Application State...`, "info");

            // Trigger building webhook
            await webhookService.triggerWebhook(application.id, WebhookStatus.PROVISIONING, {
                applicationId: application.id,
                status: ApplicationDeploymentStatus.BUILDING,
            });

            application.status = ApplicationDeploymentStatus.BUILDING;
            await appRepository.save(application);

            logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS, ApplicationDeploymentStatus.BUILDING)
            logService.emitLog(socketId, deployment.id, `Start Building Application...`, "info");

            // Build logic
            const directory = application.project.project_path
            const applicationId = String(application.id)
            let msg = ""
            if (!application.selectedRepo) {
                logService.emitLog(socketId, deployment.id, "Repository URL is required for Nixpacks.", "error");
                return;
            }
            if (existsSync(`${application.project.project_path}/${application.application_name}`)) {
                logService.emitLog(socketId, deployment.id, "Directory already exists, cleaning up...", "info");
                // rmdir(pathWhereRepoToBeCloned,(err:any)=>{
                //     logService.emitLog(socketId, application.id.toString(), "Directory already exists, cleaning up...", "info");
                //     if(err){
                //         const msgStr  =Buffer.from(err).toString()
                //         logService.emitLog(socketId, application.id.toString(), msgStr, "error");
                //         throw err;
                //     }
                //     logService.emitLog(socketId, application.id.toString(), "Cleaning up directory completed.", "info");
                // })
                await this.executeCommand(`rm -rf ${application.project.project_path}/${application.application_name}`, socketId, deployment.id, "Cleaning up directory completed.")
            }
            if (application.source_type === "zip") {
                const uploadPath = `${application.project.project_path}/${application.application_name}/${application.file.file_name}`
                logService.emitLog(socketId, deployment.id, "Extracting ZIP file...", "info");

                await fileOperations.extractZip(uploadPath,
                    `${application.project.project_path}/${application.application_name}`,
                    (msg: string) => logService.emitLog(socketId, deployment.id, msg, "info")
                )
                logService.emitLog(socketId, deployment.id, "Extraction of ZIP file completed.", "info");

            } else {
                logService.emitLog(socketId, deployment.id, `Cloning repository: ${application.selectedRepo}`, "info");
                await git.clone(application.selectedRepo, `${application.project.project_path}/${application.application_name}`, {})

                logService.emitLog(socketId, deployment.id, `Repository Successfully Cloned...`, "info");

            }
            switch (application.selectedBuilder) {

                case "nixpack":
                    logService.emitLog(socketId, deployment.id, "Checking if Nixpack is installed...", "info");
                    if (!SystemOperations.isPackageInstalled("nixpacks")) {
                        logService.emitLog(socketId, deployment.id, "Installing Nixpack", "info");
                        this.executeCommand("curl -sSL https://nixpacks.com/install.sh | bash", socketId, deployment.id, "Nixpack installed Successfully");

                    }
                    logService.emitLog(socketId, deployment.id, "Checking if Docker is installed...", "info");
                    if (!SystemOperations.isPackageInstalled("docker")) {
                        logService.emitLog(socketId, deployment.id, "Please Docker Install Docker First.", "info");
                        throw new Error("Docker not installed");
                    }
                    msg = `Building application with NixPack in ${directory}`
                    logService.emitLog(socketId, deployment.id, msg, "info")
                    await this.deployViaNixpack(application, socketId, deployment.id);
                    break;
                case "docker":
                    await this.deployViaDocker(application, socketId, deployment.id);
                    break;
                case "default":
                    await this.directDeployment(application, socketId, deployment.id)
                    break;

                default:
                    logService.emitLog(socketId, deployment.id, "Invalid deployment type. Only Nixpack and Git are supported", "error");
            }
            logService.emitLog(socketId, deployment.id, `Deploying Application...`, "info");
            application.status = ApplicationDeploymentStatus.DEPLOYING;
            await appRepository.save(application);
            logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS, ApplicationDeploymentStatus.DEPLOYING)
            const container_name = helpers.uuid_v4()
            const app_name = `${application.application_name}`
            const ci = new ContainerEntity()

            if (application.selectedBuilder === "direct") {
                const uniqueAppId =  `${application.application_id}::${deployment.id}`
                const startCommand = COMMANDS.PM2.ADD_APP
                    .replace('{startScript}', application.commands.start_command)
                    .replace('{tag}',uniqueAppId)
                const now = new Date();
                const date = formatDate(now);
                const logPath = path.join(LOG_DIR, `${date}.log`);


                await this.executeCommand(`${startCommand} --log ${logPath}`, socketId, deployment.id, "Application started successfully", `${application.project.project_path}/${app_name}`)
                logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS, ApplicationDeploymentStatus.RUNNING)
                await appRepository.update({ id: +applicationId },
                     { status: ApplicationDeploymentStatus.RUNNING,
                        metadata:{
                            ...application.metadata,
                            application_deployment_name:uniqueAppId
                        }
                        

                      });
                await this.executeCommand(`pm2 save`, socketId, deployment.id, "Backup Created")

            } else {

                application.containers.length > 0 && application.containers.filter(async (container) => {
                    // stop the container
                    if (container.container_status === ContainerStatus.RUNNING || container.is_primary) {
                        {
                            await containersService.getContainer(container.name).stop()
                            await containerRepository.update({ id: container.id, }, {
                                container_status: ContainerStatus.STOPPED,
                                stopped_at: new Date().toISOString(),
                                is_primary: false,                               
                            })                              
                        }
                    }
                })
                const container = await containersService.createContainer({
                    Image: `${application.application_id}_img:latest`,
                    name: container_name,
                    Env: application.environment_variables.map(env => `${env.key}=${env.value}`),                  
                    HostConfig: {
                        PortBindings: {
                            [`${application.port}/tcp`]: [
                                {
                                    HostIp: "0.0.0.0",
                                    HostPort: `${application.port}`,
                                },
                            ]
                        }
                    },

                })


                const inspect = await containersService.getContainer(container_name).inspect()
                await containersService.getContainerLogs(container_name, logService.socket().sockets)
                deployment.container_name = container.id
                await deploymentTrackerRepo.save(deployment)

                const containerInstance = await containerRepository.save({
                    image: `${application.application_id}_img:latest`,
                    name: container.id.substring(0,12),
                    application: {
                        id: application.id,
                    },
                    deployment: { id: deployment.id },
                    container_status: ContainerStatus.RUNNING,
                    deployment_id: deployment.id,
                    started_at: new Date().toISOString(),
                    metadata: inspect,
                    is_primary: true,
                })
                ci.id = containerInstance.id
                application.containers = [...application.containers,ci]
                await container.start()
            }

            logService.emitLog(socketId, deployment.id, `Application Deployed Successfully...`, "info");
            application.status = ApplicationDeploymentStatus.DEPLOYED;

            await appRepository.save(application);
            logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS, ApplicationDeploymentStatus.DEPLOYED)


            application.status = ApplicationDeploymentStatus.RUNNING;
            const tempSubDomain = uniqueNamesGenerator(config)
            subdomainPortMap[tempSubDomain] = +application.port
            const tempDomain=`https://${tempSubDomain}.${CONFIG.APP.APP_DOMAIN}`
            application.selected_domain =  tempDomain
            application.custom_domains = [...application.custom_domains,tempDomain]
            await appRepository.save(application);
            logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS, ApplicationDeploymentStatus.RUNNING)

            delete deploymentTracker[`app::${applicationId}`]
            deployment.status = DeploymentStatus.ACTIVE
            deployment.ended_at = new Date().toISOString()
            await deploymentTrackerRepo.save(deployment)
            logService.emitLog(socketId, deployment.id, `Custom Domain Assigned ${tempDomain}`, "info");
            logService.emitLog(socketId, deployment.id, `Application Running Successfully... http://localhost:${application.port}`, "info");

        } catch (error: any) {
            if (error.message === "Deployment cancelled") {
                logService.emitLog(socketId, deployment.id, `Deployment for application ${application?.application_name} was cancelled.`, "error");

            }
            if (error.message === "Application not found") {
                logService.emitLog(socketId, deployment.id, `Deployment failed ${application?.application_name}: ` + error.toString(), "error");
                logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS, ApplicationDeploymentStatus.FAILED)
                return
            }

            await webhookService.triggerWebhook(+applicationId, WebhookStatus.FAILED, {
                applicationId,
                status: ApplicationDeploymentStatus.FAILED,
            });
            deploymentTracker[`app::${deployment.deployment_id}`].status = "failed";
            deployment.status = DeploymentStatus.FAILED
            deployment.ended_at = new Date().toISOString()
            await deploymentTrackerRepo.save(deployment)
            logService.emitLog(socketId, deployment.id, "Deployment failed: " + error.toString(), "error");
            logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS, ApplicationDeploymentStatus.FAILED)
            await appRepository.update({ id: +applicationId }, { status: ApplicationDeploymentStatus.FAILED });
        }
    }

    private async simulateWork(applicationId: string, signal: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (signal.aborted) return reject(new Error("Deployment aborted"));
                delete deploymentTracker[applicationId]
                resolve();
            }, 2000);

            signal.addEventListener("abort", () => {
                clearTimeout(timeout);
                reject(new Error("Deployment aborted"));
            });
        });
    }



    private async directDeployment(application: ApplicationEntity, socketId: string, deployment_id: number): Promise<void> {
        try {
            if (application.useDockerfile) {
                await this.deployViaDocker(application, socketId, deployment_id);
                return
            }
            const path = application.path
            const appName = application.application_name
            const commands = application.commands
            const applicationId = application.id.toString()
            const directory = application.project.project_path

            let pathWhereRepoToBeCloned = `${directory}/${appName}`


            if (path.root_directory.trim() === "" || path.root_directory.trim() === "./") {
            } else {
                pathWhereRepoToBeCloned = `${pathWhereRepoToBeCloned}/${path.root_directory}`
            }

            logService.emitLog(socketId, deployment_id, "Installing Dependencies", "info");
            await this.executeCommand(`${commands.install_command}`, socketId, deployment_id, "Dependencies Installed", pathWhereRepoToBeCloned);

            logService.emitLog(socketId, deployment_id, "Starting Build Process...", "info");
            await this.executeCommand(`${commands.build_command}`, socketId, deployment_id, "Build completed successfully", pathWhereRepoToBeCloned)

            logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS, ApplicationDeploymentStatus.DEPLOYING)
            await appRepository.update({ id: +applicationId }, { status: ApplicationDeploymentStatus.DEPLOYING });



        } catch (error) {
            throw error
        }
    }

    private async deployViaNixpack(application: ApplicationEntity, socketId: string, deployment_id: number) {
        try {

            const project_path = application.project.project_path

            const pathWhereRepoToBeCloned = `${project_path}/${application.application_name}`


            // await this.executeCommand(`git clone ${application.selectedRepo} ${pathWhereRepoToBeCloned}`, socketId, deployment_id, "Repository Clone Successfully");
            const prepComd = `-b '${application.commands.build_command}' -i '${application.commands.install_command}' -s '${application.commands.start_command}'`


            await this.executeCommand(`nixpacks plan . -f toml > nixpacks.toml --env NIXPACKS_NODE_VERSION=22 ${prepComd}`, socketId, deployment_id, "Nixpack Plan Generated.", pathWhereRepoToBeCloned);
            const nixpackJson = readFileSync(`${pathWhereRepoToBeCloned}/nixpacks.toml`, 'utf8');


            const nixpacksPlan = toml.parse(nixpackJson) as NixpackPlan
            nixpacksPlan.phases.setup.nixPkgs[0] = "nodejs_22"
            writeFileSync(`${pathWhereRepoToBeCloned}/nixpacks.json`, JSON.stringify(nixpacksPlan, null, 2), 'utf8');
            // const { buildCommand, is_node, serveCommand, type } = await func.detectApplicationType(pathWhereRepoToBeCloned)
            logService.emitLog(socketId, deployment_id, "Start Building Nixpacks Image", "info");
            const image_name = `${application.application_id}_img:latest`

            let nixPackBuildCommand = `nixpacks build . --name ${image_name} ${prepComd} --config=nixpacks.json`
            if (application.useDockerfile) {
                const { dockerfilePath, tag, ports } = application.docker_metadata
                if (!execFileSync(`${pathWhereRepoToBeCloned}/${dockerfilePath}`)) {
                    logService.emitLog(socketId, deployment_id, `Dockerfile not found at  /${dockerfilePath}\n Please check the Dockerfile path`, "error");
                    return;
                }

                nixPackBuildCommand = `${nixPackBuildCommand} --dockerfile ${dockerfilePath} --tag ${tag} --ports ${ports}`
            }
            await this.executeCommand(`${nixPackBuildCommand}`, socketId, deployment_id, "Nixpack Building completed.", pathWhereRepoToBeCloned);

        } catch (error) {
            throw error;
        }
    }

    private async deployViaDocker(application: ApplicationEntity, socketId: string, deployment_id: number) {
        let ports = ""
        let tags = "latest"
        const project_path = application.project.project_path
        const pathWhereRepoToBeCloned = `${project_path}/${application.application_name}`

        if (application.useDockerfile) {
            const { dockerfilePath, tag: customTag, ports: customPorts } = application.docker_metadata
            if (!existsSync(`${pathWhereRepoToBeCloned}/${dockerfilePath}`)) {
                throw new Error(`Dockerfile not found at  /${dockerfilePath}\n Please check the Dockerfile path`);
            }
            tags = customTag ?? tags
            ports = customPorts.join(" ")
            return;
        }

        // if (path.root_directory.trim() === "" || path.root_directory.trim() === "./") {
        // } else {
        //     pathWhereRepoToBeCloned = `${pathWhereRepoToBeCloned}/${path.root_directory}`
        // }
        if (!existsSync(`${pathWhereRepoToBeCloned}/.dockerignore`)) {
            writeFileSync(`${pathWhereRepoToBeCloned}/.dockerignore`, this.prepareDockerIgnorContent(), { encoding: 'utf8' });
        }
        const envType = await func.detectAppPackageEnvironment(pathWhereRepoToBeCloned)
        const installCMD = envType === "bun" ? `npm install -g bun \\  \n && ${application.commands.install_command}`
            : envType === "yarn" ? `npm install -g yarn \\ \n && ${application.commands.install_command}`
                : envType === "pnpm" ? `npm install -g pnpm \\ \n&& ${application.commands.install_command}`
                    : application.commands.install_command
        logService.emitLog(socketId, deployment_id, "Building Docker Image", "info");
        await this.prepareCustomDockerFile(pathWhereRepoToBeCloned, {
            BUILD: application.commands.build_command,
            PORT: [application.port],
            INSTALL: installCMD,
            START: (application.commands.start_command || "npm run start").split(' '),
            NODE_VERSION: "node:22",
        })
      
        const dockerBuildCommand = `cd ${pathWhereRepoToBeCloned} && docker build  . -t ${application.application_id}_img:latest -f Dockerfile  --no-cache`;


        // if (application.docker_metadata?.ports) {
        //     for (let value of application.docker_metadata.ports) {
        //         ports += `-p ${value}:${value} `
        //     }
        // }
        await this.executeCommand(dockerBuildCommand, socketId, deployment_id, "Docker deployment completed.");
    }

    private async autoDeploy(application: ApplicationEntity, socketId: string, deployment_id: number) {
        try {
            // logService.emitLog(socketId, deployment_id, `Cloning repository: ${repoUrl}`, "info");
            // const command = `git clone ${repoUrl} ${appName}`;
            // await this.executeCommand(command, socketId, deployment_id, "Repository Cloned Successfully");
            // logService.emitLog(socketId, deployment_id, "Starting build process...", "info");
            // const deployCommand = `cd ${appName} && npx nixpacks build .`
            // this.executeCommand(deployCommand, socketId, deployment_id, "Nixpack Build Successfull");
        } catch (error: any) {
            logService.emitLog(socketId, deployment_id, `Error: ${error.message}`, "error");
            throw error;
        }
    }
    private async createBackup(directory: string): Promise<void> {
        console.log(`Creating backup for ${directory}`);
        const backupPath = path.join(directory, "backup.zip");

        return new Promise((resolve, reject) => {
            exec(`zip -r ${backupPath} ${directory}`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
    async rollbackApplication(applicationId: number): Promise<void> {
        const application = await appRepository.findOne({ where: { id: applicationId } });
        if (!application) throw new Error("Application not found");

        const latestLog = await logService.latestLog(applicationId)

        if (!latestLog) throw new Error("No previous successful deployment found for rollback");


        try {
            // Rollback logic based on selected builder
            //     const lastSuccessfulDeployment = await containerRepository
            //     .createQueryBuilder('container')
            //     .leftJoinAndSelect('container.deployment', 'deployment')
            //     .where('deployment.deployment_id = :deploymentId', { deploymentId })
            //     .andWhere('container.container_status = :status', { status: 'running' })
            //     .getOne();

            //   if (!lastSuccessfulDeployment) {
            //     throw new Error('No previous deployment found to rollback');
            //   }


        } catch (error: any) {
            throw error;
        }
    }

    async executeCommand(command: string, socketId: string, deployment_id: number, successMessage: string, cwd: string = DEPLOYMENT_DIR): Promise<void> {
        return new Promise((resolve, reject) => {

            const process = spawn(command, { shell: "bash", cwd });

            process.stdout.on("data", (data) => {
                logService.emitLog(socketId, deployment_id, data.toString(), "info");
            });

            process.stderr.on("data", (data) => {
                logService.emitLog(socketId, deployment_id, data.toString(), "warn");
            });

            process.on("close", (code) => {
                if (code === 0) {
                    logService.emitLog(socketId, deployment_id, successMessage, "info");
                    resolve();
                } else {
                    logService.emitLog(socketId, deployment_id, `Process exited with code ${code}.`, "error");
                    reject(new Error(`Process exited with code ${code}`));
                }
            });

            process.on("error", (err) => {
                logService.emitLog(socketId, deployment_id, `Process failed: ${err.message}`, "error");
                reject(err);
            });
        });
    }

    async prepareCustomDockerFile(writeDockerFilePath: string, args: {

        BUILD: string;
        PORT: string[];
        INSTALL: string;
        START: string[];
        NODE_VERSION: string;
    }) {
        const dockerfilePath = path.join(writeDockerFilePath, "Dockerfile");
        const templatePath = path.join(process.cwd(), "src", "utils", "libs", "data", "DockerFile.hbs");
        const template = readFileSync(templatePath, "utf8");
        hbs.registerHelper('raw', function (options) {
            return options.fn();
        });
        const variables = this.prepareCustomVariablesJson(args);
        const compiledTemplate = hbs.compile(template);
        const result = compiledTemplate(variables);
        writeFileSync(dockerfilePath, result, {
            encoding: 'utf8'
        });
    }
    async prepareCustomNixpacksJson(writeNixpacksJsonPath: string) {

    }
    private prepareDockerIgnorContent(): string {
        return `.vscode         
Makefile
README.md
.env
*.env
*.log
dist
build
out
export
node_modules
.dockerignore
.DS_Store
.git
.github
.gitignore
.gitlab-ci.yml
.gitmodules
.idea
.data
.sass-cache
tests
README.md
Dockerfile
Dockerfile.archive
docker-compose.yml

*/temp*
*/*/temp*
docker
.vagrant
.data
.idea
app/sessions/*
app/logs/*
app/cache/*
app/gen-src/*
app/conf/config.yml
app/*.zip
app/*.sql
app/*.tar.gz
*.zip
*.sql
*.log
*.tar.gz
themes/*/build
themes/*/node_modules
themes/*/app
*/*/*/node_modules
files/*
web/files/*
*/*/*/src-img
*/*/src-img
*/*.log
Vagrantfile
pimple.json

!vendor
!app/gen-src/GeneratedNodeSources/.gitignore
!app/gen-src/Proxies/.gitignore
!docker/php-nginx-alpine/crontab.txt
!docker/php-nginx-alpine/before_launch.sh
!themes/BaseTheme/static
!themes/BaseTheme/Resources/views/partials/*
!themes/BaseTheme/Resources/views/base.html.twig
!web/themes/*
        `
    }
    private prepareCustomVariablesJson(variables: {
        BUILD: string;
        PORT: string[];
        INSTALL: string;
        START: string[];
        NODE_VERSION: string;
    }) {
        const customVariablesJson = {
            BUILD: variables.BUILD,
            PORT: variables.PORT.join(" "),
            INSTALL: variables.INSTALL,
            START: JSON.stringify(variables.START),
            NODE_VERSION: variables.NODE_VERSION,
        };
        return customVariablesJson;
    }
    emitEvent(eventName: string,message: string): void {
        logService.socket().emit(eventName, message)
    }
    
}

export default new DepploymentService();
