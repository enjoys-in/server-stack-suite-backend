
import { LOGS_LEVEL_TYPES } from '../interfaces';
import { EVENT_CONSTANTS } from '../helpers/events.constants';
import { InjectRepository } from '@/factory/typeorm';
import { InitLogs } from '../helpers/file-logs';
import { OnEvent } from '../decorators';
import { Server } from 'socket.io';
import { exec } from 'child_process';
import { SERVER_COMMANDS } from '@/utils/paths';
import { AuditLogsEnitity } from "@/factory/entities/audit_logs.entity";
import { LogsProvider } from "@/handlers/providers/logs.provider";

const logsProvider = new LogsProvider()
const logsRepo = InjectRepository(AuditLogsEnitity)
export class EventsListeners { 
 constructor(private io:Server) {
  this.io = io
 }
  private insertLogsInDB({ title, log, level }: { title: string, log: string, level: LOGS_LEVEL_TYPES }) {
    return logsRepo.save({
      title,
      log,
      key:level,
     
    })
  }
  // ERROR RELATED EVENTS LISTENERS
  @OnEvent(EVENT_CONSTANTS.LOGS.INFO, { async: true })
  handleLogs(message: string) {
    InitLogs(message, "INFO")
    logsProvider.sendPayload({
      level: "info",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.ERROR, { async: true })
  handleErrorEvent(message: string) {
    InitLogs(message, "ERROR")
    logsProvider.sendPayload({
      level: "error",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.WARN, { async: true })
  handleErrorEvent3(message: string) {
    InitLogs(message, "ERROR")
    logsProvider.sendPayload({
      level: "warn",
      message
    })
  }
  @OnEvent(EVENT_CONSTANTS.LOGS.DEBUG, { async: true })
  handleErrorEvent4(message: string) {
    InitLogs(message, "ERROR")
    logsProvider.sendPayload({
      level: "debug",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.LOG, { async: true })
  handleErrorEvent5(message: string) {
    InitLogs(message, "ERROR")
    logsProvider.sendPayload({
      level: "log",
      message
    })
  }
  
  @OnEvent(EVENT_CONSTANTS.RUN_COMMAND, { async: true })
  handleRunCommand(message: string) {    
    this.handleLogs(message)
    this.sendWithCMD(message)
  }
  

private sendWithCMD(cmd: string) {
    exec(cmd, (error, stdout, stderr) => {
        if (error && error !== null) {
            return logsProvider.sendPayload({ message: error.message, level: "error" });

        }
        if (stdout) {
            return logsProvider.sendPayload({ message: stdout, level: "info" });
        }
        if (stderr && stderr.trim().length > 0) {
            const MessageBody = `${stderr.toString()} \n`;
            return logsProvider.sendPayload({ message: MessageBody, level: "warn" });
        }
        logsProvider.sendPayload({
            level: "info",
            message: "Running " + cmd
        });
        return logsProvider.sendPayload({
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