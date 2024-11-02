
import { exec } from 'child_process';
import moment from 'moment';
import { getSocketIo } from '@/utils/services/sockets/Sockets';
import { SOCKET_EVENTS } from '@/utils/services/sockets/socketEventConstants';
import { SOCKET_PAYLOAD_TYPE } from '@/utils/interfaces';
import { SERVER_COMMANDS } from '@/utils/paths';
import { CustomFunctions } from './custom-functions';

const func = new CustomFunctions()

const io = getSocketIo()
export class SocketGateway {

    constructor() { }

    sendNotificationOnly(payload: Record<string, any>) {
        io.emit(SOCKET_EVENTS.NOTIFICATIONS, JSON.stringify(payload))
    }
    sendPayload(payload: SOCKET_PAYLOAD_TYPE) {
        const LogDateTime = moment(new Date()).format("DD-MM-YYYY hh:mm:ss A");
        const MessageBody = `${LogDateTime} [${payload.level.toLocaleUpperCase()}] ${payload.message}`;

        return io.emit(SOCKET_EVENTS.REALTIME_SERVER_OPERATION_LOGS, { level: payload.level, message: MessageBody })
    }
    sendWithCMD(cmd: string) {
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


    STOP_SERVER(server_name: keyof typeof SERVER_COMMANDS) {
        this.sendWithCMD(SERVER_COMMANDS[server_name].STOP_SERVER)
    }

    START_SERVER(server_name: keyof typeof SERVER_COMMANDS) {
        this.sendWithCMD(SERVER_COMMANDS[server_name].START_SERVER)
    }

    RESTART_SERVER(server_name: keyof typeof SERVER_COMMANDS) {
        this.sendWithCMD(SERVER_COMMANDS[server_name].RELOAD_CONF)
        this.sendWithCMD(SERVER_COMMANDS[server_name].RESTART_SERVER)
    }
    RELOAD_SERVER_CONFIG_FILES(server_name: keyof typeof SERVER_COMMANDS) {
        this.sendWithCMD(SERVER_COMMANDS[server_name].RELOAD_CONF)
    }
    TEST_CONF_FILE(server_name: keyof typeof SERVER_COMMANDS) {
        this.sendWithCMD(SERVER_COMMANDS[server_name].TEST_CONF_FILE)
    }



}
