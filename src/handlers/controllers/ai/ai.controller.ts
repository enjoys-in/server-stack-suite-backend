import type { Request, Response } from "express";
import { GoogleGenerativeAI } from '@google/generative-ai'
import { CONFIG } from "@/app/config";
import { SystemOperations } from "@/handlers/providers/system-operations";

const genAI = new GoogleGenerativeAI(CONFIG.SECRETS.GOOGLE_GEMINI_API_KEY);

class AIController {

    async genarativeAI(req: Request, res: Response) {
        try {
            const input = req.body.input
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
        Your role is backend Engineer, Architect, Dev Ops, and cyerber Security, Help me to Resolve this error message:        
        ${input}
        `;

            const resp = await model.generateContent(prompt);

            res.json({
                success: true,
                message: "Server Info",
                result: resp.response.text()
            })
            res.end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({
                    success: true,
                    message: error.message,
                    result: error
                })
                res.end();

                return
            }
            res.json({
                success: false,
                message: "Something went wrong",
                result: null
            })
            res.end();

        }

    }
    async getSuggestionsFromHistory(req: Request, res: Response) {
        try {
            const data = await SystemOperations.run(`cat ~/.bash_history`, null)
            console.log(data)
            res.json({
                success: true,
                message: "Server Info",
                result: null
            })
            res.end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({
                    success: true,
                    message: error.message,
                    result: error
                })
                res.end();

                return
            }
            res.json({
                success: false,
                message: "Something went wrong",
                result: null
            })
            res.end();

        }
    }
    async getDirectories(req: Request, res: Response) {
        try {
            const { currentPath } = req.body;
            const data = await SystemOperations.run(`ls -a ${currentPath}`, null)
            console.log(data)
            res.json({
                success: true,
                message: "Server Info",
                result: null
            })
            res.end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({
                    success: true,
                    message: error.message,
                    result: error
                })
                res.end();

                return
            }
            res.json({
                success: false,
                message: "Something went wrong",
                result: null
            })
            res.end();

        }
    }
}
export default new AIController()