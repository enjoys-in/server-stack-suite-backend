import type { Request, Response } from "express";
import projectService from "./project.service";
import { resolve } from "path";
import { IUser } from "@/utils/interfaces/user.interface";
import { existsSync, mkdirSync } from "fs";
import { DEPLOYMENT_DIR } from "@/utils/paths";
import helpers from "@/utils/helpers";

class ProjectController {
    async createNewProject(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const project = {
                name: req.body.name,
                description: req.body.description,
                project_path:"",
                created_by: {
                    id: user.uid
                }
            }
            const filteredProjectName = `project-`+helpers.purifyString(req.body.name)
            const deploymentsPath = resolve(DEPLOYMENT_DIR, user.name,filteredProjectName);
            project.project_path = deploymentsPath
            if (!existsSync(deploymentsPath)) {
                mkdirSync(deploymentsPath, { recursive: true });
            }

            const newProject = await projectService.createProject(project);
            res.json({ message: "Project created successfully", result: newProject, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    async allProject(req: Request, res: Response) {
        try {

            res.json({ message: "OK", result: await projectService.getAllProjects(), success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async getSingleProject(req: Request, res: Response) {
        try {
            const id = req.params?.id
            if (!id) {
                throw new Error("Invalid project ID");
            }
            res.json({ message: "OK", result: await projectService.getSingleProject(Number(id)), success: true }).end();



        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async deleteProject(req: Request, res: Response) {
        try {
            const id = req.params?.id
            if (!id) {
                throw new Error("Invalid project ID");
            }
            await projectService.deleteProject(Number(id))
            res.json({ message: "OK", result: {}, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

}

export default new ProjectController();
