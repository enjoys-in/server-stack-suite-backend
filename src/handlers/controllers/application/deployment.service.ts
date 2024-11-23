import * as path from "path";
import { exec, spawn } from "child_process";
import { InjectRepository } from "@/factory/typeorm";
import { WebhookService } from "@/handlers/providers/webhook.provider";
import { ApplicationEntity } from "@/factory/entities/application.entity";
import { DeploymentLogsProvider } from "@/handlers/providers/deployment-logs.provider";
import { ApplicationDeploymentStatus, Commands, Path, WebhookStatus } from "@/utils/interfaces/deployment.interface";
import { unlinkSync } from "fs";
import pm2 from "../pm2/pm2.service";
import { COMMANDS } from "@/utils/paths";
import helpers from "@/utils/helpers";


const appRepository = InjectRepository(ApplicationEntity)
const logService = new DeploymentLogsProvider()
const webhookService = new WebhookService()
 
class DepploymentService {

    async deployApplication(applicationId: number, socketId: string): Promise<void> {
        const application = await appRepository.findOne({
            where: { id: applicationId }, relations: ["project"], select: {
                project: {
                    id: true,
                    project_path: true
                }
            }
        });

        try {
            if (!application) throw new Error("Application not found");

            // Trigger provisioning webhook
            await webhookService.triggerWebhook(applicationId, WebhookStatus.PROVISIONING, {
                applicationId,
                status: "provisioning",
            });
            // Update application status
            application.status = ApplicationDeploymentStatus.PROVISIONING;
            await appRepository.save(application);
            logService.emitLog(socketId, `Provisiong Application`, "info");

            // Trigger building webhook
            await webhookService.triggerWebhook(applicationId, WebhookStatus.BUILDING, {
                applicationId,
                status: ApplicationDeploymentStatus.BUILDING,
            });

            application.status = "building";
            await appRepository.save(application);
            logService.emitLog(socketId, `Building Application`, "info");

            // Build logic
            await this.buildApplication(application, socketId);

            // Trigger deploying webhook
            await webhookService.triggerWebhook(applicationId, WebhookStatus.DEPLOYING, {
                applicationId,
                status: "deploying",
            });
            
            application.status = ApplicationDeploymentStatus.DEPLOYING
            await appRepository.save(application);
            logService.emitLog(socketId, `Deploying Application ` + application.application_name, "info");
            
            application.status = ApplicationDeploymentStatus.RUNNING
            await appRepository.save(application);
            logService.emitLog(socketId, `Application ${application.application_name} is Successfull`, "info");
     
            // Trigger ready webhook
            await webhookService.triggerWebhook(applicationId, WebhookStatus.READY, {
                applicationId,
                status: "running",
            });


        } catch (error: any) {          
            // Trigger failure webhook
            await webhookService.triggerWebhook(applicationId, WebhookStatus.FAILED, {
                applicationId,
                status: ApplicationDeploymentStatus.FAILED,
            });
            //    application?.status = ApplicationDeploymentStatus.FAILED
            logService.emitLog(socketId, "Deployment failed: " + error.toString(), "error");

            throw error;
        }
    }
    private async buildApplication(application: ApplicationEntity, socketId: string): Promise<void> {
        const directory = application.project.project_path
        const repoUrl = application.selectedRepo
        const appName = application.application_name
        const dir = application.path.root_directory
        const tmpPath = path.join(application.project.project_path,dir)
        let msg = ""
        switch (application.selectedBuilder) {
            case "nixpack":
                msg = `Building application with NixPack in ${directory}`
                logService.emitLog(socketId, msg, "info")
                await this.deployViaNixpack(repoUrl, appName, socketId);
                break;
            case "docker":
                await this.deployViaDocker(application, socketId);
                break;
            case "zip":
              
                const zipFilePath = tmpPath
                await this.deployViaZip(zipFilePath,appName,application.commands, socketId);
                break;
            case "auto":
                await this.autoDeploy(repoUrl, appName, application.path, application.commands, socketId);
                break;
            case "direct":
                msg = `Cloning repository from ${repoUrl} to ${directory}`
                 logService.emitLog(socketId, msg, "info")
                await this.directDeployment(repoUrl,tmpPath+directory,appName,application.commands,socketId)
                break;
            default:
                logService.emitLog(socketId, "Invalid deployment type. Only Nixpack and Git are supported", "error");
        }
    }
   

 private async directDeployment(repoUrl: string,directory:string,appName:string,commands:Commands,socketId:string){    
    await this.executeCommand(`git clone ${repoUrl} ${directory}`, socketId, "Repository Cloned Successfully")
 const startCommand= COMMANDS.PM2.ADD_APP
 .replace('{startScript}',commands.start_command)
 .replace('{name}',helpers.purifyString(appName))
 
    await this.executeCommand(`cd ${appName} && ${startCommand}`, socketId, "Application started successfully")
 }
    private async deployViaNixpack(repoUrl: string, appName: string, socketId: string) {
        if (!repoUrl) {
            logService.emitLog(socketId, "Repository URL is required for Nixpacks.", "error");
            return;
        }
        const command = `git clone ${repoUrl} ${appName} && cd ${appName} && npx nixpacks build .`;
        this.executeCommand(command, socketId, "Nixpack Building completed.");

    }
   
    private async deployViaDocker(application: ApplicationEntity, socketId: string) {
        let ports = ""
        if (!application?.useDockerfile) {
            logService.emitLog(socketId, "Dockerfile path are required for Docker.", "error");
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
        this.executeCommand(command, socketId, "Docker deployment completed.");
    }
    private async deployViaZip(zipFilePath: string, appName: string, startCommand: Commands, socketId: string) {
        if (!zipFilePath) {
            logService.emitLog(socketId, "ZIP file path is required for ZIP deployment.", "error");
            return;
        }

        const command = `
          unzip ${zipFilePath} -d ${appName} &&
          cd ${appName} &&
          ${startCommand}
        `;
        unlinkSync(zipFilePath)
        this.executeCommand(command, socketId, "ZIP deployment completed.");
    }
    private async autoDeploy(repoUrl: string, appName: string, paths: Path, commands: Commands, socketId: string) {
        try {
            logService.emitLog(socketId, `Cloning repository: ${repoUrl}`, "info");
            const command = `git clone ${repoUrl} ${appName}`;
            await this.executeCommand(command, socketId, "Repository Cloned Successfully");
            logService.emitLog(socketId, "Starting build process...", "info");
            const deployCommand = `cd ${appName} && npx nixpacks build .`
            this.executeCommand(deployCommand, socketId, "Nixpack Build Successfull");
        } catch (error: any) {
            logService.emitLog(socketId, `Error: ${error.message}`, "error");
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

    async executeCommand(command: string, socketId: string, successMessage: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const process = spawn(command, { shell: true });

            process.stdout.on("data", (data) => {
                logService.emitLog(socketId, data.toString(), "info");
            });

            process.stderr.on("data", (data) => {
                logService.emitLog(socketId, `ERROR: ${data.toString()}`, "error");
            });

            process.on("close", (code) => {
                if (code === 0) {
                    logService.emitLog(socketId, successMessage, "info");
                    resolve();
                } else {
                    logService.emitLog(socketId, `Process exited with code ${code}.`, "error");
                    reject(new Error(`Process exited with code ${code}`));
                }
            });

            process.on("error", (err) => {
                logService.emitLog(socketId, `Process failed: ${err.message}`, "error");
                reject(err);
            });
        });
    }



}

export default new DepploymentService();
