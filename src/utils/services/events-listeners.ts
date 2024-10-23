
import { SystemLogsEntity } from '@/factory/entities/logs.entity';
import { ChildProcess, spawn } from 'child_process'
import { Repository } from "typeorm";
import { LOGS_LEVEL_TYPES } from '../types';
import { FileOperations } from '../../handlers/providers/io-operations';
import { EVENT_CONSTANTS } from '../helpers/events.constants';
import { InjectRepository } from '@/factory/typeorm';
import { InitLogs } from '../helpers/file-logs';
import { OnEvent } from '../decorators';
import { SocketGateway } from '@/handlers/providers/socket.gateway';
import { SERVER_COMMANDS } from '../paths';



export class EventsListeners {
  private readonly logsRepo!: Repository<SystemLogsEntity>
  private readonly socket: SocketGateway
  private readonly fileOperations!: FileOperations
  constructor(){
    this.fileOperations = new FileOperations()
    this.socket = new SocketGateway()
    this.logsRepo = InjectRepository(SystemLogsEntity)
  }
  private insertLogsInDB({ title, log, level }: { title: string, log: string, level: LOGS_LEVEL_TYPES }) {
    return this.logsRepo.save({ title, log, level })
  }
  // ERROR RELATED EVENTS LISTENERS
  @OnEvent(EVENT_CONSTANTS.LOGS.INFO, { async: true })
  handleLogs(message: string) {
    InitLogs(message, "INFO")
    this.socket.sendPayload({
      level: "info",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.ERROR, { async: true })
  handleErrorEvent(message: string) {
    InitLogs(message, "ERROR")
    this.socket.sendPayload({
      level: "error",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.WARN, { async: true })
  handleErrorEvent3(message: string) {
    InitLogs(message, "ERROR")
    this.socket.sendPayload({
      level: "warn",
      message
    })
  }
  @OnEvent(EVENT_CONSTANTS.LOGS.DEBUG, { async: true })
  handleErrorEvent4(message: string) {
    InitLogs(message, "ERROR")
    this.socket.sendPayload({
      level: "debug",
      message
    })
  }

  @OnEvent(EVENT_CONSTANTS.LOGS.LOG, { async: true })
  handleErrorEvent5(message: string) {
    InitLogs(message, "ERROR")
    this.socket.sendPayload({
      level: "log",
      message
    })
  }
  @OnEvent(EVENT_CONSTANTS.SERVER_COMMAND, { async: true })
  handleRunServerCommand(message: keyof typeof SERVER_COMMANDS) {
    this.handleLogs(message)
    this.socket.RESTART_SERVER(message)
  }
  @OnEvent(EVENT_CONSTANTS.RUN_COMMAND, { async: true })
  handleRunCommand(message: string) {
    this.handleLogs(message)
    this.socket.sendWithCMD(message)
  }


}