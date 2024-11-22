import type { Request, Response } from "express";

class ContainerController {
    async startContainer(req: Request, res: Response)  {
        try {
            res.json({ message: "OK", result: null, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async stopContainer(req: Request, res: Response)  {
        try {
            res.json({ message: "OK", result: null, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async deleteContainer(req: Request, res: Response)  {
        try {
            res.json({ message: "OK", result: null, success: true });

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
    //         res.json({ message: "OK", result: null, success: true });

    //     } catch (error) {
    //         if (error instanceof Error) {
    //             res.json({ message: error.message, result: null, success: false })
    //             return;
    //         }
    //         res.json({ message: "Something went wrong", result: null, success: false })
    //     }
    // }
}

export default new ContainerController();
