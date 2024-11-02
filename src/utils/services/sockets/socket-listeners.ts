import { CustomFunctions } from '@/handlers/providers/custom-functions';
import * as socket from 'socket.io'
import { SOCKET_EVENTS } from './socketEventConstants';
 
const func =new CustomFunctions()

export class SocketListeners {
    static handleConnection(socket: socket.Socket) {
        console.log(`Socket : ${socket.id}`);
     }
    static handleDisconnection(socket: socket.Socket) { 
        console.log(`Socket disconnected: ${socket.id}`);
        socket._cleanup()
    }
 
     sendPerformanceData(socket: socket.Socket) {
        setInterval(async() =>{
            socket.emit(SOCKET_EVENTS.REALTIME_SERVER_USAGE,JSON.stringify(await func.RealTimeUsageData()))
        },1000)
    }
}