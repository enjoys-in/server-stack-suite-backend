import * as path from "path";
import { exec, spawn } from "child_process";
import { InjectRepository } from "@/factory/typeorm";
import { WebhookService } from "@/handlers/providers/webhook.provider";
import { ApplicationEntity } from "@/factory/entities/application.entity";
import { LogsProvider } from "@/handlers/providers/logs.provider";
import { ApplicationDeploymentStatus, Commands, DeploymentState, Path, WebhookStatus } from "@/utils/interfaces/deployment.interface";
import { existsSync, fstat, readFileSync, rmdirSync, unlinkSync } from "fs";
import pm2 from "../pm2/pm2.service";
import { COMMANDS } from "@/utils/paths";
import { CustomFunctions } from "@/handlers/providers/custom-functions";
import { DeploymentTrackerEntity } from "@/factory/entities/deploymen_tracker.entity";
import { SOCKET_EVENTS } from "@/utils/services/sockets/socketEventConstants";


const func = new CustomFunctions()
const appRepository = InjectRepository(ApplicationEntity)
const deploymentTracker = InjectRepository(DeploymentTrackerEntity)
const logService = new LogsProvider()
const webhookService = new WebhookService()

class DepploymentService {
    private deploymentTracker: Record<string, DeploymentState> = {};
    async deployApplication(applicationId: string, socketId: string): Promise<void> {
        // Check if there's an ongoing deployment
        logService.emitLog(socketId, applicationId, `Checking if there is another deployment is going...`, "info");
        const trackerResult = await deploymentTracker.findOne({where:{application_id: +applicationId}})
       
        if (this.deploymentTracker[applicationId]?.status === "in-progress") {
            logService.emitLog(socketId, applicationId, `Another deployment is in progress for application ${applicationId}`, "info");

            logService.emitLog(socketId, applicationId, `Cancelling current deployment for application ${applicationId}`, "warn");

            // Cancel the current deployment
            this.deploymentTracker[applicationId].abortController?.abort();
            this.deploymentTracker[applicationId].status = "cancelled";
            deploymentTracker.update({id:trackerResult?.id},{status: "cancelled"})

            logService.emitLog(socketId, applicationId, `Cancelled the current deployment for application ${applicationId}`, "warn");

        }
        // Initialize new deployment state
        logService.emitLog(socketId, applicationId, `Not Found Any Current Deployment, Initializing new deployment`, "info");

        deploymentTracker.save({application_id:+applicationId,started_at:new Date().toISOString(),status: "cancelled"})

        const abortController = new AbortController();

        this.deploymentTracker[applicationId] = { status: "in-progress", abortController };
        const application = await appRepository.findOne({
            where: { id: +applicationId }, relations: ["project"], select: {
                project: {
                    id: true,
                    project_path: true
                }
            }
        });

        try {
            if (!application) throw new Error("Application not found");

            // Trigger provisioning webhook
            await webhookService.triggerWebhook(+applicationId, WebhookStatus.PROVISIONING, {
                applicationId,
                status: "provisioning",
            });
            // Cancellation check during provisioning process
            if (abortController.signal.aborted) throw new Error("Deployment cancelled, New Deployment is Requested");
            await this.simulateWork(ApplicationDeploymentStatus.PROVISIONING, abortController.signal);

            // Update application status
            application.status = ApplicationDeploymentStatus.PROVISIONING;
            await appRepository.save(application);
        logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS,ApplicationDeploymentStatus.PROVISIONING)

            logService.emitLog(socketId, applicationId, `Provisioning new Application State...`, "info");

            // Trigger building webhook
            await webhookService.triggerWebhook(+applicationId, WebhookStatus.BUILDING, {
                applicationId,
                status: ApplicationDeploymentStatus.BUILDING,
            });

            // Cancellation check during building process
            if (abortController.signal.aborted) throw new Error("Deployment cancelled, New Deployment is Requested");
            await this.simulateWork(ApplicationDeploymentStatus.BUILDING, abortController.signal);
            application.status = ApplicationDeploymentStatus.BUILDING;
            await appRepository.save(application);
        logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS,ApplicationDeploymentStatus.BUILDING)

            logService.emitLog(socketId, applicationId, `Start Building Application...`, "info");

            // Build logic
            await this.buildApplication(application, socketId);
            // case "zip":
            //     const zipFilePath = tmpPath
            //     await this.deployViaZip(zipFilePath, appName, application.commands, socketId);
            //     break;

            // // Trigger deploying webhook
            // await webhookService.triggerWebhook(applicationId, WebhookStatus.DEPLOYING, {
            //     applicationId,
            //     status: "deploying",
            // });
            // // Cancellation check during deploying process
            // if (abortController.signal.aborted) throw new Error("Deployment cancelled, New Deployment is Requested");
            // await this.simulateWork(ApplicationDeploymentStatus.DEPLOYING, abortController.signal);
            // application.status = ApplicationDeploymentStatus.DEPLOYING

            // await appRepository.save(application);
            // logService.emitLog(socketId,applicationId, `Deploying Application ` + application.application_name, "info");



            // // Trigger ready webhook
            // await webhookService.triggerWebhook(applicationId, WebhookStatus.READY, {
            //     applicationId,
            //     status: "running",
            // });

            // if (abortController.signal.aborted) throw new Error("Deployment cancelled, New Deployment is Requested");
            // await this.simulateWork(ApplicationDeploymentStatus.RUNNING, abortController.signal);
            // application.status = ApplicationDeploymentStatus.RUNNING
            // await appRepository.save(application);
            // logService.emitLog(socketId,applicationId, `Application ${application.application_name} is Successfull`, "info");


        } catch (error: any) {
            if (error.message === "Deployment cancelled") {
                console.log(`Deployment for application ${applicationId} was cancelled.`);
            } else {
                console.error(`Deployment failed for application ${applicationId}:`, error.message);
            }
            if (error.message === "Application not found") {
                logService.emitLog(socketId, applicationId, "Deployment failed: " + error.toString(), "error");

                return
            }
            // Trigger failure webhook
            await webhookService.triggerWebhook(+applicationId, WebhookStatus.FAILED, {
                applicationId,
                status: ApplicationDeploymentStatus.FAILED,
            });
            this.deploymentTracker[applicationId].status = "idle";
            if (application) {
                application.status = ApplicationDeploymentStatus.FAILED
            }
            deploymentTracker.update({id:trackerResult?.id},{status: "cancelled",ended_at: new Date().toISOString()})

            logService.emitLog(socketId, applicationId, "Deployment failed: " + error.toString(), "error");
            logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS,ApplicationDeploymentStatus.FAILED)

            throw error;
        }
    }
    private async simulateWork(task: string, signal: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (signal.aborted) return reject(new Error("Deployment aborted"));           
                resolve();
            }, 5000); // Simulate 5 seconds of work

            signal.addEventListener("abort", () => {
                clearTimeout(timeout);
                reject(new Error("Deployment aborted"));
            });
        });
    }
    private async buildApplication(application: ApplicationEntity, socketId: string): Promise<void> {
        const directory = application.project.project_path
        const repoUrl = application.selectedRepo
        const appName = application.application_name


        const applicationId = String(application.id)
        let msg = ""
        switch (application.selectedBuilder) {
            case "nixpack":
                msg = `Building application with NixPack in ${directory}`
                logService.emitLog(socketId, applicationId, msg, "info")
                await this.deployViaNixpack(repoUrl, appName, applicationId, socketId);
                break;
            case "docker":
                await this.deployViaDocker(application, socketId);
                break;
            case "auto":
                await this.autoDeploy(repoUrl, appName, applicationId, application.path, application.commands, socketId);
                break;
            case "direct":
                logService.emitLog(socketId, applicationId, `Cloning repository from ${repoUrl} to ${directory}`, "info")
                await this.directDeployment(repoUrl, application.path, directory, appName, applicationId, application.commands, socketId)
                break;
            default:
                logService.emitLog(socketId, applicationId, "Invalid deployment type. Only Nixpack and Git are supported", "error");
        }
    }


    private async directDeployment(repoUrl: string, path: Path, directory: string, appName: string, applicationId: string, commands: Commands, socketId: string) {
       try {
        const pathWhereRepoToBeCloned = `${directory}/${appName}`
        if (existsSync(pathWhereRepoToBeCloned)) {            
            await this.executeCommand(`rm -rf ${pathWhereRepoToBeCloned}`, socketId, applicationId, "Cleaning up...")
        }
        await this.executeCommand(`git clone ${repoUrl} ${pathWhereRepoToBeCloned}`,socketId,applicationId, "Repository Successfully Cloned...")
        if (path.root_directory.trim() === "" || path.root_directory.trim() === "./") {
            path.root_directory = pathWhereRepoToBeCloned
        } else {
            path.root_directory = `${pathWhereRepoToBeCloned}/${path.root_directory}`
        }
        logService.emitLog(socketId, applicationId, "Installing Dependencies", "info");

        await this.executeCommand(`cd ${path.root_directory} &&  ${commands.additional_command}`, socketId, applicationId, "Dependencies Installed");

        await this.executeCommand(`cd ${path.root_directory} &&  ${commands.build_command}`, socketId, applicationId, "Build completed successfully")
        logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS,ApplicationDeploymentStatus.DEPLOYING)



        const startCommand = COMMANDS.PM2.ADD_APP
            .replace('{startScript}', commands.start_command)
            .replace('{name}', appName)

        await this.executeCommand(`cd ${path.root_directory} && ${startCommand}`, socketId,applicationId, "Application started successfully")
        logService.socket().to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_STATUS,ApplicationDeploymentStatus.RUNNING)

       } catch (error) {
            throw error
       }
    }
    private async deployViaNixpack(repoUrl: string, appName: string, applicationId: string, socketId: string) {
        if (!repoUrl) {
            logService.emitLog(socketId, applicationId, "Repository URL is required for Nixpacks.", "error");
            return;
        }
        const command = `git clone ${repoUrl} ${appName} && cd ${appName} && npx nixpacks build .`;
        this.executeCommand(command, socketId, applicationId, "Nixpack Building completed.");

    }

    private async deployViaDocker(application: ApplicationEntity, socketId: string) {
        let ports = ""
        if (!application?.useDockerfile) {
            logService.emitLog(socketId, String(application.id), "Dockerfile path are required for Docker.", "error");
            return;
        }
        const appName = application.docker_metadata?.tag || application.application_name
        const dockerfilePath = application.docker_metadata?.dockerfilePath
        if (application.docker_metadata?.ports) {
            for (let value of application.docker_metadata.ports) {
                ports += `-p ${value}:${value}`
            }
        }

        const command = `
          git clone ${application.selectedRepo} ${application.project.project_path}/${application.application_name} &&
          cd ${appName} &&
          docker build -f ${dockerfilePath} -t ${appName}:latest . &&
          docker run -d --name ${appName} ${ports} ${appName}:latest
        `;
        this.executeCommand(command, socketId, String(application.id), "Docker deployment completed.");
    }
    private async deployViaZip(zipFilePath: string, appName: string, applicationId: string, startCommand: Commands, socketId: string) {
        if (!zipFilePath) {
            logService.emitLog(socketId, applicationId, "ZIP file path is required for ZIP deployment.", "error");
            return;
        }

        const command = `
          unzip ${zipFilePath} -d ${appName} &&
          cd ${appName} &&
          ${startCommand}
        `;
        unlinkSync(zipFilePath)
        this.executeCommand(command, socketId, applicationId, "ZIP deployment completed.");
    }
    private async autoDeploy(repoUrl: string, appName: string, applicationId: string, paths: Path, commands: Commands, socketId: string) {
        try {
            logService.emitLog(socketId, applicationId, `Cloning repository: ${repoUrl}`, "info");
            const command = `git clone ${repoUrl} ${appName}`;
            await this.executeCommand(command, socketId, applicationId, "Repository Cloned Successfully");
            logService.emitLog(socketId, applicationId, "Starting build process...", "info");
            const deployCommand = `cd ${appName} && npx nixpacks build .`
            this.executeCommand(deployCommand, socketId, applicationId, "Nixpack Build Successfull");
        } catch (error: any) {
            logService.emitLog(socketId, applicationId, `Error: ${error.message}`, "error");
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
            if (application.selectedBuilder === "docker") {
                // await this.rollbackDocker(application.path.main_directory);
            } else if (application.selectedBuilder === "nixpack") {
                // await this.rollbackNixPack(application.path.main_directory);
            } else if (application.selectedBuilder === "zip") {
                // await this.rollbackZip(application.path.main_directory);
            }

        } catch (error: any) {
            throw error;
        }
    }

    async executeCommand(command: string, socketId: string, applicationId: string, successMessage: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const process = spawn(command, { shell: true, });

            process.stdout.on("data", (data) => {
                logService.emitLog(socketId, applicationId, data.toString(), "info");
            });

            process.stderr.on("data", (data) => {
                logService.emitLog(socketId, applicationId, data.toString(), "warn");
            });

            process.on("close", (code) => {
                if (code === 0) {
                    logService.emitLog(socketId, applicationId, successMessage, "info");
                    resolve();
                } else {
                    logService.emitLog(socketId, applicationId, `Process exited with code ${code}.`, "error");
                    reject(new Error(`Process exited with code ${code}`));
                }
            });

            process.on("error", (err) => {
                logService.emitLog(socketId, applicationId, `Process failed: ${err.message}`, "error");
                reject(err);
            });
        });
    }



}

export default new DepploymentService();
