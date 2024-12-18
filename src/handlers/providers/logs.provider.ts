import { DeploymentTrackerEntity } from "@/factory/entities/deploymen_tracker.entity";
import { DeploymentLogEntity } from "@/factory/entities/deploymentLog.entity";
import { InjectRepository } from "@/factory/typeorm";
import { LOGS_LEVEL_TYPES, SOCKET_PAYLOAD_TYPE } from "@/utils/interfaces";
import { SOCKET_EVENTS } from "@/utils/services/sockets/socketEventConstants";
import { getSocketIo } from "@/utils/services/sockets/Sockets";
import moment from "moment";

const logRepository = InjectRepository(DeploymentLogEntity)
const deploymentsRepository = InjectRepository(DeploymentTrackerEntity)
const io = getSocketIo()
type PayLoadOfLogs = { timestamp: string; level: string; deployment_id: number; message: string; }
export class LogsProvider {
  private logBuffer: PayLoadOfLogs[] = [];
  private stringLogsBuffer: string[] = [];
  private logInterval = 5000;

  constructor() {
    setInterval(() => this.flushLogs(), this.logInterval);
  }
  fetchLogs(id: number) {
    return deploymentsRepository.findOne({
      where: { id },
      relations: ["logs"], 
      
      
    })
  }
  socket() {
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
  emitLog(socketId: string, deployment_id: number, message: string, level: LOGS_LEVEL_TYPES) {
    const LogPayload: PayLoadOfLogs = {
      timestamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss A"),
      level,
      message,
     deployment_id
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
      await logRepository.save(logs.map((log) => ({ log: log.message, level: log.level, timestamp: log.timestamp, metadata: log, deployment: { id: +log.deployment_id } })));
    }
  }
  
}