import { CustomFunctions } from '@/handlers/providers/custom-functions';
import * as socket from 'socket.io'
import { SOCKET_EVENTS } from './socketEventConstants';
import { SERVER_COMMANDS } from '@/utils/paths';
import { EVENT_CONSTANTS } from '@/utils/helpers/events.constants';
import { AppEvents } from '../Events';
 
const func = new CustomFunctions()

export class SocketListeners {
   static handleConnection(socket: socket.Socket) {
      console.log(`Socket : ${socket.id}`);
      socket.on(SOCKET_EVENTS.START_SERVER, (data) => {
         const startServerCmd = SERVER_COMMANDS[data as keyof typeof SERVER_COMMANDS].START_SERVER
         AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, startServerCmd)
      })
      socket.on(SOCKET_EVENTS.STOP_SERVER, (data) => {
         const startServerCmd = SERVER_COMMANDS[data as keyof typeof SERVER_COMMANDS].STOP_SERVER
         AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, startServerCmd)
      })
      socket.on(SOCKET_EVENTS.TEST_CONF_FILE, (data) => {
         const startServerCmd = SERVER_COMMANDS[data as keyof typeof SERVER_COMMANDS].TEST_CONF_FILE
         AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, startServerCmd)
      })
      socket.on(SOCKET_EVENTS.RESTART_SERVER, (data) => {
         const startServerCmd = SERVER_COMMANDS[data as keyof typeof SERVER_COMMANDS].RESTART_SERVER
         AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, startServerCmd)
      })
      socket.on(SOCKET_EVENTS.RELOAD_SERVER_CONFIG_FILES, (data) => {
         const startServerCmd = SERVER_COMMANDS[data as keyof typeof SERVER_COMMANDS].RELOAD_CONF
         AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, startServerCmd)
      })
      socket.on(SOCKET_EVENTS.STATUS_SERVER, (data) => {
         const startServerCmd = SERVER_COMMANDS[data as keyof typeof SERVER_COMMANDS].STATUS
         AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, startServerCmd)
      })
   }
   static handleDisconnection(socket: socket.Socket) {
      console.log(`Socket disconnected: ${socket.id}`);
      socket._cleanup()
   }

   sendPerformanceData(socket: socket.Socket) {
      setInterval(async () => {
         socket.emit(SOCKET_EVENTS.REALTIME_SERVER_USAGE, JSON.stringify(await func.RealTimeUsageData()))
      }, 1000)
   }
}