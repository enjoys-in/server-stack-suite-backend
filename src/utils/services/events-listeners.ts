
import { SystemLogsEntity } from '@/factory/entities/logs.entity';
import { Repository } from "typeorm";
import { LOGS_LEVEL_TYPES } from '../interfaces';
import { FileOperations } from '../../handlers/providers/io-operations';
import { EVENT_CONSTANTS } from '../helpers/events.constants';
import { InjectRepository } from '@/factory/typeorm';
import { InitLogs } from '../helpers/file-logs';
import { OnEvent } from '../decorators';
import { Server } from 'socket.io';
import { exec } from 'child_process';
import moment from 'moment';
import { SOCKET_EVENTS } from '@/utils/services/sockets/socketEventConstants';
import { SOCKET_PAYLOAD_TYPE } from '@/utils/interfaces';
import { SERVER_COMMANDS } from '@/utils/paths';

const fileOperations = new FileOperations()
const logsRepo = InjectRepository(SystemLogsEntity)
export class EventsListeners { 
 constructor(private io:Server) {
  this.io = io
 }
  private insertLogsInDB({ title, log, level }: { title: string, log: string, level: LOGS_LEVEL_TYPES }) {
    return logsRepo.save({ title, log, level })
  }
  // ERROR RELATED EVENTS LISTENERS
  @OnEvent(EVENT_CONSTANTS.LOGS.INFO, { async: true })
  handleLogs(message: string) {
    InitLogs(message, "INFO")
    this.sendPayload({
      level: "info",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.ERROR, { async: true })
  handleErrorEvent(message: string) {
    InitLogs(message, "ERROR")
    this.sendPayload({
      level: "error",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.WARN, { async: true })
  handleErrorEvent3(message: string) {
    InitLogs(message, "ERROR")
    this.sendPayload({
      level: "warn",
      message
    })
  }
  @OnEvent(EVENT_CONSTANTS.LOGS.DEBUG, { async: true })
  handleErrorEvent4(message: string) {
    InitLogs(message, "ERROR")
    this.sendPayload({
      level: "debug",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.LOG, { async: true })
  handleErrorEvent5(message: string) {
    InitLogs(message, "ERROR")
    this.sendPayload({
      level: "log",
      message
    })
  }
  
  @OnEvent(EVENT_CONSTANTS.RUN_COMMAND, { async: true })
  handleRunCommand(message: string) {    
    this.handleLogs(message)
    this.sendWithCMD(message)
  }
  
  sendNotificationOnly(payload: Record<string, any>) {
    this.io.emit(SOCKET_EVENTS.NOTIFICATIONS, JSON.stringify(payload))
}
private sendPayload(payload: SOCKET_PAYLOAD_TYPE) {
    const LogDateTime = moment(new Date()).format("DD-MM-YYYY hh:mm:ss A");
    const MessageBody = `${LogDateTime} [${payload.level.toLocaleUpperCase()}] ${payload.message}`;

    return this.io.emit(SOCKET_EVENTS.REALTIME_SERVER_OPERATION_LOGS, { level: payload.level, message: MessageBody })
}
private sendWithCMD(cmd: string) {
    exec(cmd, (error, stdout, stderr) => {
        if (error && error !== null) {
            return this.sendPayload({ message: error.message, level: "error" });

        }
        if (stdout) {
            return this.sendPayload({ message: stdout, level: "info" });
        }
        if (stderr && stderr.trim().length > 0) {
            const MessageBody = `${stderr.toString()} \n`;
            return this.sendPayload({ message: MessageBody, level: "warn" });
        }
        this.sendPayload({
            level: "info",
            message: "Running " + cmd
        });
        return this.sendPayload({
            level: "info",
            message: "Done..."
        });
    })
}


private STOP_SERVER(server_name: keyof typeof SERVER_COMMANDS) {
    this.sendWithCMD(SERVER_COMMANDS[server_name].STOP_SERVER)
}

private START_SERVER(server_name: keyof typeof SERVER_COMMANDS) {
    this.sendWithCMD(SERVER_COMMANDS[server_name].START_SERVER)
}

private RESTART_SERVER(server_name: keyof typeof SERVER_COMMANDS) {
    this.sendWithCMD(SERVER_COMMANDS[server_name].RELOAD_CONF)
    this.sendWithCMD(SERVER_COMMANDS[server_name].RESTART_SERVER)
}
private RELOAD_SERVER_CONFIG_FILES(server_name: keyof typeof SERVER_COMMANDS) {
    this.sendWithCMD(SERVER_COMMANDS[server_name].RELOAD_CONF)
}
private TEST_CONF_FILE(server_name: keyof typeof SERVER_COMMANDS) {
    this.sendWithCMD(SERVER_COMMANDS[server_name].TEST_CONF_FILE)
}

}