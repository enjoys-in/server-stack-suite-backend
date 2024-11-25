import { DeploymentLogEntity } from "@/factory/entities/deploymentLog.entity";
import { InjectRepository } from "@/factory/typeorm";
import { LOGS_LEVEL_TYPES, SOCKET_PAYLOAD_TYPE } from "@/utils/interfaces";
import { ApplicationDeploymentStatus } from "@/utils/interfaces/deployment.interface";
import { SOCKET_EVENTS } from "@/utils/services/sockets/socketEventConstants";
import { getSocketIo } from "@/utils/services/sockets/Sockets";
import moment from "moment";

const logRepository = InjectRepository(DeploymentLogEntity)
const io = getSocketIo()
 type PayLoadOfLogs =  {  timestamp: string;  level: string; application_id:string; message: string; }
export class LogsProvider {
  private logBuffer: PayLoadOfLogs[] = [];
  private stringLogsBuffer: string[] = []; 
  private logInterval = 5000;
 
  constructor() {
    setInterval(() => this.flushLogs(), this.logInterval);
  }
  fetchLogs(applicationId:number){
    return logRepository.find({
      where:{
        application:applicationId,
      }
    })
  }
  socket(){
    return io
  }
  sendNotificationOnly(payload: Record<string, any>) {
    io.emit(SOCKET_EVENTS.NOTIFICATIONS, JSON.stringify(payload))
  }
  private prepareMessageBody(message: string, level: string): string {
    const LogDateTime = moment(new Date()).format("DD-MM-YYYY hh:mm:ss A");
    return `${LogDateTime} • [${level.toLocaleUpperCase()}] • ${message}`;

  }
  sendPayload(payload: SOCKET_PAYLOAD_TYPE) {
    const message = this.prepareMessageBody(payload.message, payload.level);
    return io.emit(SOCKET_EVENTS.REALTIME_SERVER_OPERATION_LOGS, { level: payload.level, message: message })
  }
  emitLog2(socketId: string, message: string, level: LOGS_LEVEL_TYPES) {
    const MessageBody = this.prepareMessageBody(message, level);
    io.to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_LOGS, MessageBody);   
    this.stringLogsBuffer.push(MessageBody);    
  }
  emitLog(socketId: string, application_id:string,message: string, level: LOGS_LEVEL_TYPES) {
    const LogPayload:PayLoadOfLogs = {
      timestamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss A"),
      level,
      message,
      application_id
    };
    io.to(socketId).emit(SOCKET_EVENTS.DEPLOYMENT_LOGS, LogPayload);
    this.logBuffer.push(LogPayload);
  }
 
  latestLog(id: number) {
    return logRepository.findOne({
      where: {
        id,        
      },
      order: { timestamp: "DESC" },
    });

  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length > 0) {
      const logs = this.logBuffer.splice(0, this.logBuffer.length); 
      await logRepository.save(logs.map((log) => ({ log: log.message, level:log.level, timestamp: log.timestamp,metadata:log ,application:+log.application_id})));
    }
  }
  private async saveLogs(appName: string, deploymentStatus: ApplicationDeploymentStatus) {
    try {
      const logs = this.stringLogsBuffer.join("\n"); // Combine all logs into a single string.
      //   const deploymentLog =logRepository.create({
      // application:{id:1},
      //     deploymentStatus,
      //     logs,
      //   });
      //   await logRepository.save(deploymentLog);
      this.stringLogsBuffer = [];
    } catch (error) {
      console.error("Failed to save logs:", error);
    }
  }
}