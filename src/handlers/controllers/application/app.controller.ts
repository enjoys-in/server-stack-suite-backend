import type { Request, Response } from "express";
import applicationService from "./application.service";
import deploymentService from "./deployment.service";
import { ApplicationDeployment } from "@/utils/interfaces/deployment.interface";
import { AppEvents } from "@/utils/services/Events";
import { EVENT_CONSTANTS } from "@/utils/helpers/events.constants";
import { OnEvent } from "@/utils/decorators";
import { USER_STORE } from "@/utils/services/sockets/Sockets";
import { LogsProvider } from "@/handlers/providers/logs.provider";

const logsProvider = new LogsProvider()
class ApplicationController {
  
  async getApplication(req: Request, res: Response) {
    try {
      const id = req.params?.id;
      if (!id) {
        throw new Error(`Application not found`)
      }
      const data = await applicationService.getSingleApplication(Number(id))
      res.json({ success: true, message: "Application found", result: data, }).end();
    } catch (error: any) {
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
      const data = await applicationService.getSingleApplication(Number(id))
      res.json({ success: true, message: "Application found", result: data, }).end();
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
      const body = req.body as ApplicationDeployment
      const socketId = await USER_STORE.get(String(req.user?.uid))
      const appIntance = await applicationService.createNewApplication(body)

      res.json({ success: true, message: "Deployment initiated.", result: { application_id:appIntance.id } })
     
      if (appIntance.id) {
        AppEvents.emit(EVENT_CONSTANTS.DEPLOYMENT.STARTED, { application_id: appIntance.id, socketId })
      }
      res.end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }

  async rollbackApplication(req: Request, res: Response) {
    try {
      const body = req.body as ApplicationDeployment

      const appIntance = await applicationService.createNewApplication(body)

      res.json({ success: true, message: "Deployment initiated.", result: { application_id: "appIntance.id" } })

      if (appIntance.id) {
        AppEvents.emit(EVENT_CONSTANTS.DEPLOYMENT.STARTED, JSON.stringify({
          application_id: appIntance.id,
          ...body
        }))
      }
      res.end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async test(req: Request, res: Response) {
    try {
      const body = req.body as  { application_id:string, socketId:string }
      deploymentService.deployApplication(body.application_id,body.socketId)

      res.json({ success: true, message: "Deployment initiated.", result:  {} }).end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  async deploymentLogs(req: Request, res: Response) {
    try {
      const application_id = req.params.application_id   
      if (!application_id) {
          throw new Error(`Application not found`)
      }
     
      res.json({ success: true, message: "Deployment initiated.", result:  await logsProvider.fetchLogs(Number(application_id)) }).end()
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
  @OnEvent(EVENT_CONSTANTS.DEPLOYMENT.STARTED,{
    async:true,
  })
  private async deploymentStarted(payload: { application_id:string, socketId:string }) {   
    deploymentService.deployApplication(payload.application_id,payload.socketId)
  }
}

export default new ApplicationController()