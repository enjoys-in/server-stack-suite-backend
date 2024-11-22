import { Server, Socket } from "socket.io";
import { Logging } from "@/logs";
import type { Server as HttpServer } from 'http'
import { SOCKET_EVENTS } from "./socketEventConstants";
import { SocketListeners } from "./socket-listeners";
import * as  chokidar from "chokidar"
import * as pty from "node-pty"

let ptyProcess:pty.IPty;
let io: Server;
const watcher = chokidar.watch(process.cwd(), {
  ignored: /(^|[\/\\])\../,
  persistent: true,
});
export const InitSocketConnection = (server: HttpServer) => {
  Logging.dev("Socket are Initialized")
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? process.env.REACT_APP_URL : "*",
    }
  })
  const listeners = new SocketListeners()
  io.on('connection', (socket: Socket) => {

    socket.on(SOCKET_EVENTS.CONNECT_TERMINAL,()=> {
        ptyProcess = pty.spawn('bash', [], {
        name: 'xterm-256color',
        cols: 200,
        rows: 25,
        cwd: process.env.HOME,
        env: process.env
  
      });
      
      ptyProcess.onData((data) => socket.emit(SOCKET_EVENTS.RECIEVE_COMMAND, data));
      socket.on(SOCKET_EVENTS.SEND_COMMAND, (data: string) => ptyProcess.write(data))
    })  
    socket.on(SOCKET_EVENTS.SSH_EMIT_RESIZE, (size: any) => ptyProcess.resize(size.cols, size.rows))
    SocketListeners.handleConnection(socket)
    listeners.sendPerformanceData(socket)
    
    socket.on("disconnect", () => {
      if(ptyProcess)ptyProcess.kill()
      SocketListeners.handleDisconnection(socket)
    });

    socket.on("disconnecting", async (reason) => {
      console.log(`socket ${socket.id} disconnected due to ${reason}`);
    });
    // watcher.on("all", (event, path) => {
    //   io.emit(SOCKET_EVENTS.FILE_CHANGE, { event, path });
    // });
  });

  return io
};
export const getSocketIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

