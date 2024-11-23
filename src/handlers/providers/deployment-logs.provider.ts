import { DeploymentLogEntity } from "@/factory/entities/deploymentLog.entity";
import { InjectRepository } from "@/factory/typeorm";
import { LOGS_LEVEL_TYPES } from "@/utils/interfaces";
import { ApplicationDeploymentStatus } from "@/utils/interfaces/deployment.interface";
import { SOCKET_EVENTS } from "@/utils/services/sockets/socketEventConstants";
import { getSocketIo } from "@/utils/services/sockets/Sockets";
import moment from "moment";

const logRepository = InjectRepository(DeploymentLogEntity)
const io = getSocketIo()

export class DeploymentLogsProvider {
    private logsBuffer: string[] = [];   
    private logInterval = 5000;

    constructor() {
        setInterval(() => this.flushLogs(), this.logInterval);
    }
    emitLog(socketId: string, message: string, level: LOGS_LEVEL_TYPES) {
      const LogDateTime = moment(new Date()).format("DD-MM-YYYY hh:mm:ss A");
      const MessageBody = `${LogDateTime} • [${level.toLocaleUpperCase()}] • ${message}`;
      io.to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_LOGS, MessageBody);
      this.log(MessageBody);
  }
   private  async log(message: string): Promise<void> {
        this.logsBuffer.push(message);
    }
    latestLog(id: number) {
        return logRepository.findOne({
            where: {
                id,                
             status: ApplicationDeploymentStatus.ACTIVE },
            order: { timestamp: "DESC" },
          });
           
     }

    private async flushLogs(): Promise<void> {
        if (this.logsBuffer.length > 0) {
            const logs = this.logsBuffer.splice(0, this.logsBuffer.length);
            await logRepository.save(logs.map((log) => ({ message: log, timestamp: new Date() })));
        }
    }
    private async saveLogs(appName: string, deploymentStatus: ApplicationDeploymentStatus) {
        try {
          const logs = this.logsBuffer.join("\n"); // Combine all logs into a single string.
        //   const deploymentLog =logRepository.create({
            // application:{id:1},
        //     deploymentStatus,
        //     logs,
        //   });
        //   await logRepository.save(deploymentLog);
          this.logsBuffer = [];  
        } catch (error) {
          console.error("Failed to save logs:", error);
        }
      }
}