import type { Request, Response } from "express";
import applicationService from "./application.service";
import deploymentService from "./deployment.service";
import { AppEvents } from "@/utils/services/Events";
import { EVENT_CONSTANTS } from "@/utils/helpers/events.constants";
import { OnEvent } from "@/utils/decorators";
import { USER_STORE } from "@/utils/services/sockets/Sockets";
import { LogsProvider } from "@/handlers/providers/logs.provider";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { CreateApplicaionDTO } from "./dto/application.dto";
import { PATHS, } from "@/utils/paths";
import { NginxSample } from "@/utils/libs/samples/ngnix/demo";
import { FileOperations } from "@/handlers/providers/io-operations";
import containersService from "../containers/containers.service";
import { SOCKET_EVENTS } from "@/utils/services/sockets/socketEventConstants";

const logsProvider = new LogsProvider()
const fileOperations = new FileOperations()

class ApplicationController {
  async checkExistApplication(req: Request, res: Response) {
    try {
      const id = req.params?.id;
      if (!id) {
        throw new Error(`Application not found`)
      }
      res.json({ success: await applicationService.hasSingleApplication(Number(id)), message: "Application found", result: null, }).end();
    } catch (error: any) {
      console.log(error)
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async getApplication(req: Request, res: Response) {
    try {
      const id = req.params?.id;
      if (!id) {
        throw new Error(`Application not found`)
      }
      const data = await applicationService.getSingleApplication(Number(id))
      if (!data) {
        throw new Error(`Application not found`)
      }
      res.json({ success: true, message: "Application found", result: data, }).end();
    } catch (error: any) {
      console.log(error)
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async updateApplicationMetadata(req: Request, res: Response) {
    try {
      const id = req.params?.id;
      if (!id) {
        throw new Error(`Application not found`)
      }
      if (req.body.custom_domains && req.body.toBeRemove) {
        const nginxFile = PATHS.NGINX.SITES_ENABLED_LOCATION_FILE.replace(":file_name", req.body.removeNginxFileOf)
        if (existsSync(nginxFile)) {
          unlinkSync(nginxFile)
        }
        delete req.body.toBeRemove
      }

      if (req.body.selected_domain && req.body.is_assigned && req.body.port) {
        const nginxFile = PATHS.NGINX.SITES_ENABLED_LOCATION_FILE.replace(":file_name", req.body.selected_domain)

        if (existsSync(nginxFile)) {
          unlinkSync(nginxFile)
        }
        let fileContent = NginxSample.DeployApi([`www.${req.body.selected_domain}`, req.body.selected_domain], `http://localhost:${req.body.port}`, "/")

        await fileOperations.writeFile(nginxFile, fileContent)
        delete req.body.is_assigned
      }
      const data = await applicationService.updateApplicationMetadata(Number(id), req.body)
      res.json({ success: true, message: "Application Updated", result: null, }).end();
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async deleteApplication(req: Request, res: Response) {
    try {
      const id = req.params?.id;
      if (!id) {
        throw new Error(`Application not found`)
      }
      const application = await applicationService.getSingleApplication(+id)
      if (!application) {
        throw new Error(`Application not found`)
      }
      if (application.selectedBuilder === "direct") {
        execSync(`rm -rf ${join(application.project.project_path, application.application_name)}`)
        execSync(`pm2 delete ${application.application_name}::${application.id}`)
      } else {

        // containersService.getContainer(application.containers.pop()?.name)
        // await containersService.deleteContainer(application.application_name)
      }



      const data = await applicationService.deleteApplication(Number(id))

      res.json({ success: true, message: "Application found", result: data, }).end();
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }

  async deployNewApplication(req: Request, res: Response) {
    try {
      const body = req.body as CreateApplicaionDTO
      const socketId = USER_STORE.get(String(req.user?.uid))
      const appIntance = await applicationService.createNewApplication(body)

      res.json({ success: true, message: "Deployment initiated.", result: { application_id: appIntance.id } })

      if (appIntance.id) {
        AppEvents.emit(EVENT_CONSTANTS.DEPLOYMENT.STARTED, { application_id: appIntance.id, socketId })
      }
      res.end()
    } catch (error: any) {
      console.log(error)
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }

  async rollbackApplication(req: Request, res: Response) {
    try {

      const id = req.params?.application_id;

      const application = await applicationService.getSingleApplication(+id)
      if (!application) {
        throw new Error(`Application not found`)
      }
      const appName = application.application_name
      const directory = application.project.project_path
      let pathWhereRepoToBeCloned = `${directory}/${appName}`


      // res.json({ success: true, message: "Deployment initiated.", result:  await deploymentService.testDocker(appIntance) })

      // if (appIntance.id) {
      //   AppEvents.emit(EVENT_CONSTANTS.DEPLOYMENT.STARTED, JSON.stringify({
      //     application_id: appIntance.id,
      //     ...body
      //   }))
      // }
      res.end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async reDeployApplication(req: Request, res: Response) {
    try {
      const socketId = USER_STORE.get(String(req.user?.uid))
      const body = req.body as { application_id: string }
      AppEvents.emit(EVENT_CONSTANTS.DEPLOYMENT.STARTED, { application_id: body.application_id, socketId: socketId! })

      res.json({ success: true, message: "ReDeployment initiated.", result: {} }).end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async getDepoymentEvents(req: Request, res: Response) {
    try {
      const application_id = req.params.application_id
      if (!application_id) {
        throw new Error(`Application not found`)
      }
      res.json({
        success: true,
        message: "Deployment Events.",
        result: await applicationService.getApplicationDeploymentEvents(Number(application_id)),
      }).end()

    } catch (error: any) {
      console.log(error)
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async deploymentLogs(req: Request, res: Response) {
    try {
      const deployment_id = req.params.deployment_id
      if (!deployment_id) {
        throw new Error(`deployment_id not found`)
      }

      res.json({ success: true, message: "Deployment initiated.", result: await logsProvider.fetchLogs(Number(deployment_id)) }).end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async stopTheDeployement(req: Request, res: Response) {
    try {
      const application_id = req.params.application_id
      if (!application_id) {
        throw new Error(`Application not found`)
      }
      await deploymentService.stopDeploy(application_id)
      res.json({ success: true, message: "Stoping the Current Deployment", result: {} }).end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async getLiveTailLogs(req: Request, res: Response) {
    try {
      const namespace = req.params.namespace
      if (!namespace) {
        throw new Error(`Application not found`)
      }
      // Ensure namespace does not already exist
      if (req.io!.of(`/${namespace}`)) {
        throw new Error(`Namespace already exists`)
      }
      const nsp = req.io!.of(`/${namespace}`);
      nsp.on('connection', (socket) => {
        let logStream: any;

        socket.on(SOCKET_EVENTS.CONTAINER_LOGS_START, async (containerId) => {
          try {
            const container = containersService.getContainer(containerId)
            logStream = await container.logs({
              stdout: true,
              stderr: true,
              follow: true,
              tail: 100,
            });

            logStream.on('data', (chunk: any) => {
              socket.emit(SOCKET_EVENTS.CONTAINER_LOGS, chunk.toString('utf-8'));
            });

            logStream.on('error', (err: any) => {
              socket.emit(SOCKET_EVENTS.CONTAINER_LOGS, 'Error streaming logs');
            });

          } catch (error) {
            socket.emit(SOCKET_EVENTS.CONTAINER_LOGS, 'Failed to fetch logs');
          }
        })
        socket.on(SOCKET_EVENTS.CONTAINER_LOGS_STOP, () => {
          if (logStream) {
            logStream.destroy?.();
            logStream.unpipe?.();
            logStream.end?.();
            logStream = null;
          }
        });
        socket.on('disconnect', () => {
          if (logStream) {
            logStream.destroy?.();
            logStream.unpipe?.();
            logStream.end?.();
            logStream = null;
          }
        });
      })
      res.json({ success: true, message: "Uploading logs", result: {} }).end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async addHealthCheck(req: Request, res: Response) {
    try {
      const body = req.body as {
        path: string;
        application_id: string;
        is_maintainance_mode: boolean;
        is_active: boolean;    }
    
      await applicationService.addApplicationHealthCheck(body)
      res.json({ success: true, message: "Health Check Addded", result: {} }).end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  @OnEvent(EVENT_CONSTANTS.DEPLOYMENT.STARTED, {
    async: true,
  })
  private async deploymentStarted(payload: { application_id: string, socketId: string }) {
    deploymentService.deployApplication(payload.application_id, payload.socketId)
  }
}

export default new ApplicationController()