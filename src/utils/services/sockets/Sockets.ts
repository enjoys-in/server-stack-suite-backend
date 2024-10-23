import { Server, Socket } from "socket.io";
import { Logging } from "@/logs";
import type { Server as HttpServer } from 'http'
import { SOCKET_EVENTS } from "./socketEventConstants";
import { SocketListeners } from "./socket-listeners";
import * as  chokidar from "chokidar"

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
    SocketListeners.handleConnection(socket)
    listeners.sendPerformanceData(socket)
    socket.on("disconnect", () => SocketListeners.handleDisconnection(socket));
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

