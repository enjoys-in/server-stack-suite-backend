import { Server, Socket } from "socket.io";
import { Logging } from "@/logs";
import type { Server as HttpServer } from 'http'
import { SOCKET_EVENTS } from "./socketEventConstants";
import { SocketListeners } from "./socket-listeners";
import * as  chokidar from "chokidar"
import * as pty from "node-pty"
import containersService from "@/handlers/controllers/containers/containers.service";

let ptyProcess: pty.IPty;
let io: Server;
export const USER_STORE = new Map<string, string>()
const watcher = chokidar.watch(process.cwd(), {
  ignored: /(^|[\/\\])\../,
  persistent: true,
});
const InitSocketConnection = (server?: HttpServer) => {
  Logging.dev("Socket are Initialized")
  const io = new Server({
    cors: {
      origin: process.env.NODE_ENV === 'development' ? process.env.REACT_APP_URL : "*",
    }
  })
  const listeners = new SocketListeners()
  io.on('connection', (socket: Socket) => {
    console.log(`Socket : ${socket.id}`);
    SocketListeners.handleConnection(socket)
    listeners.sendPerformanceData(socket)

    socket.on("add_user", (data: { user_id: string }) => {
      USER_STORE.set(String(data.user_id), socket.id)
    });
    // Listen for TErminal  events
    socket.on(SOCKET_EVENTS.CONNECT_TERMINAL, (path: string | undefined) => {
      ptyProcess = pty.spawn('bash', [], {
        name: 'xterm-256color',
        cols: 140,
        rows: 25,
        cwd: path || process.env.HOME,
        env: process.env
      });
      ptyProcess.onData((data) => socket.emit(SOCKET_EVENTS.RECIEVE_COMMAND, data));
      socket.on(SOCKET_EVENTS.SEND_COMMAND, (data: string) => ptyProcess.write(data))
    })
    socket.on(SOCKET_EVENTS.SSH_EMIT_RESIZE, (size: any) => ptyProcess.resize(size.cols, size.rows))



    // Listen for docker Shell events
    socket.on(SOCKET_EVENTS.CONTAINER_SHELL_START, async (data: string) => {
      const container = containersService.getContainer(data);
      const shell = await container.exec({        
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        Tty: true,
        Cmd: ["/bin/sh"],
      });
      const stream = await shell.start({ hijack: true, stdin: true });
      socket.on(SOCKET_EVENTS.CONTAINER_SHELL_MESSAGE, (msg) => stream.write(msg));
      socket.on(SOCKET_EVENTS.CONTAINER_SHELL_RESIZE, (size: any) => shell.resize({ w: size.cols, h: size.rows }, (err: any) => {
        if (err) {
          socket.emit(SOCKET_EVENTS.CONTAINER_SHELL_INPUT, `Resize error: ${err.message}`);
        }
      }))
      stream.on("data", (chunk) => {
        socket.emit(SOCKET_EVENTS.CONTAINER_SHELL_INPUT, chunk.toString('utf8'));
      });

      stream.on("end", () => io.close());
      stream.on("error", (err) => {
        socket.emit(SOCKET_EVENTS.CONTAINER_SHELL_INPUT, `Error: ${err.message}`);

      });
    })
    // watcher.on("all", (event, path) => {
    //   io.emit(SOCKET_EVENTS.FILE_CHANGE, { event, path });
    // });



    socket.on("disconnect", () => {
      if (ptyProcess) ptyProcess.kill()
      SocketListeners.handleDisconnection(socket)
    });

    socket.on("disconnecting", async (reason) => {
      console.log(`socket ${socket.id} disconnected due to ${reason}`);
    });
  });

  return io
};
io = InitSocketConnection()

export const getSocketIo = () => io

