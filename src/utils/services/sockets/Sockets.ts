import { Server, Socket } from "socket.io";
import { Logging } from "@/logs";
import type { Server as HttpServer } from 'http'
let io: Server;

export const InitSocketConnection = (server: HttpServer) => {
  Logging.dev("Socket are Initialized")
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? process.env.REACT_APP_URL : "*",
    }
  })
  io.on('connection', (socket: Socket) => {
    socket.on("disconnecting", async (reason) => {
      console.log(`socket ${socket.id} disconnected due to ${reason}`);
    });
    socket.on('disconnect', () => { });
  });

  return io
};
export const getSocketIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

