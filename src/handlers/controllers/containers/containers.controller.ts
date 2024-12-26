import type { Request, Response } from "express";
import containersService from "./containers.service";
import tar from "tar-stream";

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
            const path = req.query.path as string || "/";
            const containerId = req.params.container_tag;
            const container = await containersService.getContainer(String(containerId));

            const stream = await container.getArchive({ path });
            const extract = tar.extract();
            const files: { name: string; type: any; size: number | undefined }[] = [];

            // Listen for entries in the TAR stream
            extract.on("entry", (header, stream, next) => {
                const { name, type, size } = header;

                // Add file details to the array
                files.push({ name, type, size });

                // Drain the stream (required to continue to the next entry)
                stream.on("end", () => next());
                stream.resume();
            });

            // Handle end of TAR stream
            extract.on("finish", () => {
                res.json({ message: "OK", files, success: true });
            });

            // Pipe the Docker stream into the TAR parser
            stream.pipe(extract);

            // Handle stream errors
            stream.on("error", (err) => {

                res.status(500).json({ message: "Stream error", success: false, result: null });
            });

        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message, success: false, result: null });
            } else {
                res.status(500).json({ message: "Something went wrong", success: false, result: null });
            }
        }
    }


    async getContainerInfo(req: Request, res: Response) {
        try {
            const containerId = req.params.container_tag
            const socket = req.io?.sockets
            containersService.getContainerStats(containerId, socket)
            const inspectContainer = await containersService.inspectContainer(containerId,)

            res.json({ message: "OK", result: inspectContainer, success: true }).end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
        }
    }
    async getContainerLogs(req: Request, res: Response) {
        try {
            const containerId = req.params.container_tag
            const socket = req.io?.sockets
            containersService.getContainerLogs(containerId, socket)
            res.end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false }).end()
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
