import Dockerode, { Container } from "dockerode";
import { SOCKET_EVENTS } from "@/utils/services/sockets/socketEventConstants";
import { Socket } from "socket.io";
import { DockerCreateContainerOptions } from "@/utils/interfaces/deployment.interface";
import { IDockerImageOptions } from "@/utils/interfaces/docker.interface";
const options = { socketPath: "/var/run/docker.sock" }

const docker = new Dockerode()



class ContainerService {

  async getContainerLogs(container_tag: string, socket: any): Promise<any> {

    try {
      const container = this.getContainer(container_tag);
      const logStream = await container.logs({
        stdout: true,
        stderr: true,
        follow: true,
        tail: 100,
      });

      logStream.on('data', (chunk) => {
        const log = chunk.toString('utf-8');
        socket.emit(SOCKET_EVENTS.CONTAINER_LOGS, log);
      });

      logStream.on('error', (err) => {
        socket.emit(SOCKET_EVENTS.CONTAINER_LOGS, 'Error streaming logs');
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logStream.unpipe();

      });

    } catch (error) {
      socket.emit(SOCKET_EVENTS.CONTAINER_LOGS, 'Failed to fetch logs');
    }
  }
  async getContainerShell(container_tag: string, socket: Socket): Promise<any> {
    try {
      const container = this.getContainer(container_tag);
      const shell = await container.exec({
        //   Cmd: ["bash", "-c", "echo $SHELL"],
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        Tty: true,
        Cmd: ["/bin/bash"],
      });
      const stream = await shell.start({ hijack: true, stdin: true });

      socket.on(SOCKET_EVENTS.CONTAINER_SHELL_MESSAGE, (msg) => stream.write(msg));

      stream.on("data", (chunk) => {
        socket.emit(SOCKET_EVENTS.CONTAINER_SHELL_INPUT, chunk.toString());
      });
      socket.on(SOCKET_EVENTS.CONTAINER_SHELL_RESIZE, (size: any) => shell.resize({ w: size.cols, h: size.rows }, (err: any) => {
        if (err) {
          socket.emit(SOCKET_EVENTS.CONTAINER_SHELL_INPUT, `Resize error: ${err.message}`);
        }
      }))

      stream.on("error", (err) => {
        socket.emit(SOCKET_EVENTS.CONTAINER_SHELL_INPUT, `Error: ${err.message}`);

      });
    } catch (error: any) {
      socket.emit(SOCKET_EVENTS.CONTAINER_SHELL_INPUT, `Error: ${error.message}`);
      throw error
    }
  }

  async listContainers(): Promise<Dockerode.ContainerInfo[]> {
    return docker.listContainers();
  }
  createContainerImage(options: Partial<IDockerImageOptions>): Promise<any> {
    let chunks =""
    
    return new Promise((resolve, reject) => {
      docker.createImage({ fromImage: 'node:22-alpine',cachefrom: ['node:22-alpine'],...options},(err:any, stream:any) => {
        if (err) {
          
          reject('Error creating image:'+ err);
        } else {

          stream.on('data', (chunk:any) => {
            chunks = chunk.toString()           
          });
          
          stream.on('end', () => {
            resolve(chunks)
          });
        }
      })
    })
  }
  deleteContainer(containerId: string){
    return this.getContainer(containerId).remove();
  }
  getContainer(containerId: string): Container {
    return docker.getContainer(containerId);
  }
  getContainerByName(name: string): Container {
    return docker.getContainer(name);
  }
  getContainerStats(name: string): any {
    return this.getContainer(name).stats();
  }
  inspectContainer(name: string): any {
    return this.getContainer(name).inspect();
  }
  /**
   * Creates a new Docker container using the specified options.
   *
   * @param options - The configuration options for creating the container, 
   *                  including image, name, exposed ports, environment variables, 
   *                  working directory, healthcheck, and host configuration.
   * @returns A promise that resolves to the created Docker container.
   * @example  "Image": "image",
      "name": "name",      
      "ExposedPorts": {
        "yourport": {} // Expose port 1473
      },
      "Env": ["MY_ENV_VAR=example"],
      "WorkingDir": "/usr/src/app",
      "Healthcheck":{
        "Interval": 60000
      },
      "HostConfig": {
        "PortBindings": {
          "yourport": [
            {
              "HostPort": "1473"
            }
          ]
        }
      }
   */
  async createContainer(options: DockerCreateContainerOptions): Promise<Container> {

    return docker.createContainer({
      Cmd: ["bash", "-c", "echo $SHELL"],
      WorkingDir: "/app",
      ...options
    });
  }
  async removeContainer(containerId: string): Promise<void> {
    return this.getContainer(containerId).remove();
  }
  async stopContainer(containerId: string): Promise<void> {
    return this.getContainer(containerId).stop();
  }
  async startContainer(containerId: string): Promise<void> {
    return this.getContainer(containerId).start();
  }

  async executeCommand(containerId: string, command: string[]): Promise<string> {
    const container = this.getContainer(containerId);
    const exec = await container.exec({
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
    });
    const stream = await exec.start({ hijack: true });
    return new Promise((resolve, reject) => {
      let output = "";
      stream.on("data", (chunk) => (output += chunk.toString()));
      stream.on("end", () => resolve(output));
      stream.on("error", (err) => reject(err));
    });
  }

  async getFile(containerId: string, path: string): Promise<Buffer> {
    const container = this.getContainer(containerId);
    const stream = await container.getArchive({ path });
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    return new Promise((resolve, reject) => {
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", (err) => reject(err));
    });
  }

  async uploadFile(containerId: string, path: string, fileContent: string): Promise<void> {
    const container = this.getContainer(containerId);
    const tar = require("tar-stream");
    const pack = tar.pack();
    pack.entry({ name: path }, fileContent);
    pack.finalize();
    const stream = await container.putArchive(pack, {});
    return new Promise((resolve, reject) => {
      stream.on("end", resolve);
      stream.on("error", reject);
    });
  }
}

export default new ContainerService();
