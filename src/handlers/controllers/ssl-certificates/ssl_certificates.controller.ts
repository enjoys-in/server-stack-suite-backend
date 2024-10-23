import type { Request, Response } from "express";

class SslCertificatesController{
    async findAll(req: Request, res: Response) {
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
    async create(req: Request, res: Response) {
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
  
    private createAutoSSL(req: Request, res: Response) {
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
    async findOne(req: Request, res: Response) {
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
    async delete(req: Request, res: Response) {
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
    
 
  
}
export default new SslCertificatesController()