import { exec, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface DeploymentOptions {
    type: "nixpack" | "docker" | "zip";
    appName: string;
    repoUrl?: string; // Required for nixpack or docker
    dockerfilePath?: string; // Required for docker
    zipFilePath?: string; // Required for zip
    buildCommand?: string; // Optional build command for nixpack
    startCommand: string; // Start command for all methods
}

interface DeploymentResult {
    success: boolean;
    message: string;
}

class DepploymentService {
    private logsBuffer: string[] = []; 
    async deploy(options: DeploymentOptions, socketId: string): Promise<void> {
        switch (options.type) {
            case "nixpack":
                await this.deployViaNixpack(options, socketId);
                break;
            case "docker":
                await this.deployViaDocker(options, socketId);
                break;
            case "zip":
                await this.deployViaZip(options, socketId);
                break;
            default:
                this.emitLog(socketId, "Invalid deployment type.");
        }
    }

    private async deployViaNixpack(options: DeploymentOptions, socketId: string) {
        if (!options.repoUrl) {
            this.emitLog(socketId, "Repository URL is required for Nixpacks.");
            return;
        }

        const command = `git clone ${options.repoUrl} ${options.appName} && cd ${options.appName} && npx nixpacks build .`;
        this.executeCommand(command, socketId, "Nixpack deployment completed.");
    }

    private async deployViaDocker(options: DeploymentOptions, socketId: string) {
        if (!options.repoUrl || !options.dockerfilePath) {
            this.emitLog(socketId, "Repository URL and Dockerfile path are required for Docker.");
            return;
        }

        const command = `
          git clone ${options.repoUrl} ${options.appName} &&
          cd ${options.appName} &&
          docker build -f ${options.dockerfilePath} -t ${options.appName}:latest . &&
          docker run -d --name ${options.appName} -p 8080:8080 ${options.appName}:latest
        `;
        this.executeCommand(command, socketId, "Docker deployment completed.");
    }
    async deployFromGit(repoUrl: string, type: "nixpack" | "docker", appName: string, startCommand: string, socketId: string) {
        try {
        //   this.loggerService.log(socketId, `Cloning repository: ${repoUrl}`);
          const command = `git clone ${repoUrl} ${appName}`;
        //   this.executeCommand(command, socketId);
    
          const deployCommand =
            type === "nixpack"
              ? `cd ${appName} && npx nixpacks build .`
              : `cd ${appName} && docker build -t ${appName}:latest . && docker run -d --name ${appName} -p 8080:8080 ${appName}:latest`;
    
        //   this.loggerService.log(socketId, "Starting build process...");
        //   this.executeCommand(deployCommand, socketId);
        } catch (error) {
        //   this.loggerService.log(socketId, `Error: ${error.message}`);
          throw error;
        }
      }
    private async deployViaZip(options: DeploymentOptions, socketId: string) {
        if (!options.zipFilePath) {
            this.emitLog(socketId, "ZIP file path is required for ZIP deployment.");
            return;
        }

        const command = `
          unzip ${options.zipFilePath} -d ${options.appName} &&
          cd ${options.appName} &&
          ${options.startCommand}
        `;
        this.executeCommand(command, socketId, "ZIP deployment completed.");
    }

    private executeCommand(command: string, socketId: string, successMessage: string): void {
        const process = spawn(command, { shell: true });

        process.stdout.on("data", (data) => {
            this.emitLog(socketId, data.toString());
        });

        process.stderr.on("data", (data) => {
            this.emitLog(socketId, `ERROR: ${data.toString()}`);
        });

        process.on("close", (code) => {
            if (code === 0) {
                this.emitLog(socketId, successMessage);
            } else {
                this.emitLog(socketId, `Process exited with code ${code}.`);
            }
        });
    }

    private emitLog(socketId: string, message: string) {
        // this.io.to(socketId).emit("log", message);
    }
    private saveLogs(appName: string, deploymentStatus: "SUCCESS" | "FAILURE") {
        try {
          const logs = this.logsBuffer.join("\n"); // Combine all logs into a single string.
        //   const deploymentLog = this.dataSource.getRepository(DeploymentLog).create({
        //     appName,
        //     deploymentStatus,
        //     logs,
        //   });
        //   await this.dataSource.getRepository(DeploymentLog).save(deploymentLog);
          this.logsBuffer = []; // Clear buffer after saving.
        } catch (error) {
          console.error("Failed to save logs:", error);
        }
      }
    
}

export default new DepploymentService();
