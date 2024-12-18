import type { Request, Response } from "express";
import containersService from "./containers.service";

class ContainerController {
    async startContainer(req: Request, res: Response) {
        try {
            res.json({ message: "OK", result: null, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false }).end()
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async stopContainer(req: Request, res: Response) {
        try {
            res.json({ message: "OK", result: null, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false }).end()
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async deleteContainer(req: Request, res: Response) {
        try {
            res.json({ message: "OK", result: null, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false }).end()
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async getContainerFiles(req: Request, res: Response) {
        try {
            const path = req.query.path as string || "/"
            const containerId = req.params.containerId
            const containerFiles = containersService.getFile(String(containerId), path)
            res.json({ message: "OK", result: containerFiles, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    // async dumy(req: Request, res: Response)  {
    //     try {
    //         res.json({ message: "OK", result: null, success: true }).end();

    //     } catch (error) {
    //         if (error instanceof Error) {
    //             res.json({ message: error.message, result: null, success: false })
    //             return;
    //         }
    //         res.json({ message: "Something went wrong", result: null, success: false }).end()
    //     }
    // }
}

export default new ContainerController();
