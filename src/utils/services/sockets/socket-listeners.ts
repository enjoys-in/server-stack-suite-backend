import { CustomFunctions } from '@/handlers/providers/custom-functions';
import * as socket from 'socket.io'
import { SOCKET_EVENTS } from './socketEventConstants';
import { CRUD, SERVER_COMMANDS, SYSTEMCTL } from '@/utils/paths';
import { EVENT_CONSTANTS } from '@/utils/helpers/events.constants';
import { AppEvents } from '../Events';

const func = new CustomFunctions()
interface SystemdServiceData {
   action: string;
   services: any[];
}
export class SocketListeners {
   static handleConnection(socket: socket.Socket) {

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
      socket.on(SOCKET_EVENTS.SYSTEMD_SERVICES, (data: SystemdServiceData) => {
         if (data.action === "reload") {
            const cmd = SYSTEMCTL.RELOAD
            AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, cmd)
            return socket.emit(SOCKET_EVENTS.SYSTEMD_SERVICE_STATUS, JSON.stringify({status: "done" }))
         }
         const cmd = SYSTEMCTL[data.action.toLocaleLowerCase() as keyof typeof SYSTEMCTL]
         data.services.forEach((service) => {
            AppEvents.emit(EVENT_CONSTANTS.RUN_COMMAND, cmd.replace("{service_name}", service))
            socket.emit(SOCKET_EVENTS.SYSTEMD_SERVICE_STATUS, JSON.stringify({...data, status: "done" }))
         })

      })
   }
   static handleDisconnection(socket: socket.Socket) {
      console.log(`Socket disconnected: ${socket.id}`);
      socket._cleanup()
   }

   sendPerformanceData(socket: socket.Socket) {
      setInterval(async () => {
         socket.emit(SOCKET_EVENTS.SYSTEM_INFORMATION, JSON.stringify(await func.systemInformation()))
      }, 2500)
      setInterval(async () => {
         socket.emit(SOCKET_EVENTS.REALTIME_SERVER_USAGE, JSON.stringify(await func.RealTimeUsageData()))
      }, 1000)
   }
}