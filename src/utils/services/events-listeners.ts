
import { SystemLogsEntity } from '@/factory/entities/logs.entity';
import { ChildProcess, spawn } from 'child_process'
import { Repository } from "typeorm";
import { LOGS_LEVEL_TYPES } from '../interfaces';
import { FileOperations } from '../../handlers/providers/io-operations';
import { EVENT_CONSTANTS } from '../helpers/events.constants';
import { InjectRepository } from '@/factory/typeorm';
import { InitLogs } from '../helpers/file-logs';
import { OnEvent } from '../decorators';
import { SocketGateway } from '@/handlers/providers/socket.gateway';
import { AppEvents } from './Events';

 
const fileOperations = new FileOperations()
const socket = new SocketGateway()
const logsRepo = InjectRepository(SystemLogsEntity)
export class EventsListeners {
   constructor(){
   
   }
 
  private insertLogsInDB({ title, log, level }: { title: string, log: string, level: LOGS_LEVEL_TYPES }) {
    return logsRepo.save({ title, log, level })
  }
  // ERROR RELATED EVENTS LISTENERS
  @OnEvent(EVENT_CONSTANTS.LOGS.INFO, { async: true })
  handleLogs(message: string) {
    InitLogs(message, "INFO")
    socket.sendPayload({
      level: "info",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.ERROR, { async: true })
  handleErrorEvent(message: string) {
    InitLogs(message, "ERROR")
    socket.sendPayload({
      level: "error",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.WARN, { async: true })
  handleErrorEvent3(message: string) {
    InitLogs(message, "ERROR")
    socket.sendPayload({
      level: "warn",
      message
    })
  }
  @OnEvent(EVENT_CONSTANTS.LOGS.DEBUG, { async: true })
  handleErrorEvent4(message: string) {
    InitLogs(message, "ERROR")
    socket.sendPayload({
      level: "debug",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.LOG, { async: true })
  handleErrorEvent5(message: string) {
    InitLogs(message, "ERROR")
    socket.sendPayload({
      level: "log",
      message
    })
  }
  
  @OnEvent(EVENT_CONSTANTS.RUN_COMMAND, { async: true })
  handleRunCommand(message: string) {    
    this.handleLogs(message)
    socket.sendWithCMD(message)
  }

  handleRunCommand2(message: string) {    
    this.handleLogs(message)
    socket.sendWithCMD(message)
  }
}