import type { Request, Response } from "express";
import applicationService from "./application.service";
import { ApplicationDeployment } from "@/utils/interfaces/deployment.interface";
import { AppEvents } from "@/utils/services/Events";
import { EVENT_CONSTANTS } from "@/utils/helpers/events.constants";


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
     const appIntance =  await applicationService.createNewApplication(body)   

      res.json({ success: true, message: "Deployment initiated.",result:{application_id:appIntance.id} })
      
      if (appIntance.id) {      
        AppEvents.emit(EVENT_CONSTANTS.DEPLOYMENT.STARTED,JSON.stringify({
         application_id:appIntance.id,
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

  async deployGit(req: Request, res: Response) {
    try {
      const { appName, repoUrl, type, startCommand } = req.body;

      if (!appName || !repoUrl || !type || !startCommand) {
        return res.status(400).json({ error: "Invalid request payload." });
      }

      const socketId = req.headers["socket-id"] as string;
      // await this.deploymentService.deployFromGit(repoUrl, type, appName, startCommand, socketId);
      res.json({ success: true, message: "Deployment initiated." });
    } catch (error: any) {
      if (error instanceof Error) {
        res.json({ message: error.message, result: null, success: false })
        return;
      }
      res.json({ message: "Something went wrong", result: null, success: false })
    }
  }
}

export default new ApplicationController()