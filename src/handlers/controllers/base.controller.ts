import { formatDate, HandleLogs } from "@/utils/helpers/file-logs";
import type { Request, Response } from "express";
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFile, writeFileSync } from "fs";
import { extname, join, resolve } from "path";
import AppService from '@handlers/providers/app.provider'
const SERVER_CONFIG = join(process.cwd(), "./sever.config.json")
const LOG_DIR = join(process.cwd(), "logs")
import Client from 'ssh2-sftp-client'
import { Logging } from "@/logs";
import { DEPLOYMENT_DIR, SERVER_TYPE_FILE_PATH } from "@/utils/paths";
import { OnAppShutDown, OnAppStart } from "@/utils/interfaces/application.interface";
import { onEnableHook } from "@/utils/decorators";
import { FileOperations } from "../providers/io-operations";
import { FileHandler, UploadFileBody } from "@/utils/interfaces/fileupload.interface";
import { CustomFunctions } from "../providers/custom-functions";
import helpers from "@/utils/helpers";

const fileOps = new FileOperations()
const func = new CustomFunctions()

@onEnableHook()
class BaseController implements OnAppStart, OnAppShutDown {

    constructor() {
        this.setUpServerStackSuite()
    }
    async onAppShutDown() {
        const { UpdateLogsToFileOnShutDown } = await HandleLogs();
        UpdateLogsToFileOnShutDown()
    }
    async onAppStart() {
        const { UpdateLogsToFileOnStartup } = await HandleLogs();
        UpdateLogsToFileOnStartup()

    }


    async uploadFiles(req: Request, res: Response) {
        try {

            const files = req.files?.upload_zip as FileHandler
            if (!files) {
                throw new Error("No files uploaded");
            }
            if (Array.isArray(files)) {
                throw new Error("Multiple files are not supported");
            }

            const renameFile = helpers.purifyString(files.name)
            const body = req.body as UploadFileBody
            const { application_name, project_path } = body;
            const filePath = join(project_path, application_name)


            if (!existsSync(filePath)) {
                mkdirSync(filePath, { recursive: true })
            }
            if (existsSync(join(filePath, renameFile))) {
                unlinkSync(join(filePath, renameFile))
            }
            const uploadPath = `${filePath}/${renameFile}`;
            await files.mv(uploadPath)
            const id = helpers.Md5Checksum(Date.now().toString())
            const key = helpers.SimpleHash()
            const extenstion = extname(files.name)
            const createInfo = {
                file_id: id, key, extenstion,
                "name": files.name,
                "modified_name": renameFile,
                "size": files.size,
                "encoding": files.encoding,
                "tempFilePath": files.tempFilePath,
                "truncated": files.truncated,
                "mimetype": files.mimetype,
                "md5": files.md5,
            }

            await fileOps.extractZip(uploadPath, filePath)
            const appType = await func.detectApplicationType(filePath)

            res.json({
                success: true,
                message: "Files Uploaded Successfully",
                result: {
                    fileInfo: { ...createInfo, file_path: filePath },
                    appType
                }
            })
            res.end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
            res.end();

        }
    }
    async readServerAnaylitcs(req: Request, res: Response) {
        try {
            const analytics = await AppService.getAnalytics()

            res.json({
                success: true,
                message: "Server Info",
                result: {
                    analytics,
                    info: JSON.parse(readFileSync(SERVER_CONFIG, { encoding: "utf8" }))
                }
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
    async serverLogs(req: Request, res: Response) {
        try {
            if (!existsSync(`${LOG_DIR}/${formatDate(new Date())}.log`)) {
                res.json({
                    success: true,
                    message: "Server Logs",
                    result: `No logs found`
                })
                res.end();
            }
            res.json({
                success: true,
                message: "Server Logs",
                result: readFileSync(`${LOG_DIR}/${formatDate(new Date())}.log`, { encoding: "utf8" })
            });
            res.end();

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
            res.end();

        }
    }
    async fileSystemInfo(req: Request, res: Response) {
        try {
            const wholeFileSystem = await AppService.execute("df -h")
            const currentFileSystem = await AppService.execute("df -h /")
            const parseLines = (input: string) => {
                const lines = input.trim().split('\n');
                const headers = lines[0].split(/\s+/).filter(header => header);

                const data = lines.slice(1).map(line => {
                    const parts = line.split(/\s+/).filter(part => part);
                    return headers.reduce((obj: any, header, index) => {
                        obj[header] = parts[index] || null;
                        return obj;
                    }, {});
                });
                return data
            }
            const filesystemInfo = parseLines(wholeFileSystem)
            const currentFileSystemInfo = parseLines(currentFileSystem)
            const filteredFilesystemInfo = filesystemInfo.filter(
                (item: any) => item.Filesystem !== "none" && item.Filesystem !== "snapfuse"
            );
            res.json({
                success: true,
                message: "Server Info",
                result: {
                    Active: currentFileSystemInfo,
                    All: filteredFilesystemInfo
                }
            });
            res.end();
        } catch (error) {
            if (error instanceof Error) {
                res.json({
                    success: true,
                    message: error.message,
                    result: error
                })
                return
            }

            res.json({
                success: false,
                message: "Something went wrong",
                result: null
            })
            res.end()
        }
    }

    async setUpServerStackSuite() {
        try {
            let infoStack: any
            if (existsSync(SERVER_CONFIG)) {
                Logging.dev("Setting up server Done")
            } else {

                const Services = [
                    { cmd: "nginx -v", name: "Nginx", },
                    { cmd: "apachectl -v", name: "Apache" },
                    { cmd: "caddy version", name: "Caddy" },
                    { cmd: "docker -v", name: "Docker" },
                    { cmd: "kubectl version --client", name: "Kubernetes" },
                    { cmd: "pm2 -v", name: "PM2" },
                    { cmd: "node -v", name: "NodeJS", },
                    { cmd: "git --version", name: "Git" },
                    { cmd: "certbot --version", name: "SSL" },
                    { cmd: "nixpacks --version", name: "NixPack" },

                ]
                const checkedData = await Promise.all(
                    Services.map(async ({ cmd, name }) => await AppService.checkCommand(cmd, name))
                );
                const ubuntuInfoString = await AppService.execute("lsb_release -a")
                const cpuinfoString = await AppService.execute("cat /proc/cpuinfo")
                const hostnamectlString = await AppService.execute("hostnamectl")
                const totalMemory = await AppService.execute("grep MemTotal /proc/meminfo | awk '{print $2 / 1024 / 1024}'")

                const parseUbuntuInfo = (input: string) => {
                    const lines = input.split('\n').map(line => line.trim());
                    const ubuntuInfo: Record<string, string> = {};

                    lines.forEach(line => {
                        const [key, value] = line.split(':').map(part => part.trim());
                        if (key && value) {
                            ubuntuInfo[key] = value;
                        }
                    });

                    return ubuntuInfo;
                };
                const ubuntuInfoJson = parseUbuntuInfo(ubuntuInfoString);
                const hostnamectlJson = parseUbuntuInfo(hostnamectlString);
                const cpuInfoJson = parseUbuntuInfo(cpuinfoString);
                const stdout = await AppService.execute("lscpu")
                const lines = stdout.split('\n').map(line => line.trim());
                const cpuInfo: any = {
                    Architecture: '',
                    'CPU op-mode(s)': '',
                    'Address sizes': '',
                    'Byte Order': '',
                    'CPU(s)': '',
                    'Vendor ID': '',
                    'Model name': '',
                    'CPU family': '',
                    'Model': '',
                    'Thread(s) per core': '',
                    'Core(s) per socket': '',
                    'Socket(s)': '',
                    'Stepping': '',
                    'BogoMIPS': '',
                    'Flags': '',
                    Virtualization: '',
                    'Hypervisor vendor': '',
                    'Virtualization type': '',
                    Caches: {},
                    Vulnerabilities: {}
                };
                let currentSection = '';
                // Parse each line
                lines.forEach(line => {
                    if (!line) return;

                    // Detect cache section
                    if (line.startsWith('L1d:') || line.startsWith('L1i:') || line.startsWith('L2:') || line.startsWith('L3:')) {
                        const [cacheName, cacheValue] = line.split(':').map(v => v.trim());
                        cpuInfo.Caches[cacheName] = cacheValue;
                        return;
                    }

                    // Detect vulnerabilities section
                    if (line.startsWith('Gather data sampling') || line.startsWith('Itlb multihit') || line.startsWith('L1tf') || line.startsWith('Mds') || line.startsWith('Meltdown') || line.startsWith('Retbleed') || line.startsWith('Spec rstack overflow') || line.startsWith('Spec store bypass') || line.startsWith('Spectre v1') || line.startsWith('Spectre v2') || line.startsWith('Srbds') || line.startsWith('Tsx async abort')) {
                        const [vulnerability, status] = line.split(':').map(v => v.trim());
                        cpuInfo.Vulnerabilities[vulnerability] = status;
                        return;
                    }

                    // Regular key-value parsing
                    const [key, value] = line.split(':').map(v => v.trim());
                    if (key && value) {
                        cpuInfo[key] = value;
                    }
                });

                infoStack = {
                    Packages: checkedData,
                    HardwareInfo: { ...cpuInfo, ...cpuInfoJson },
                    ServerInfo: { ...ubuntuInfoJson, ...hostnamectlJson, TotalMemory: totalMemory }
                }
                writeFileSync(SERVER_CONFIG, JSON.stringify(infoStack))
            }

        } catch (error) {
            console.log(error)
        }
    }

    async getFiles(req: Request, res: Response) {
        try {
            const { type, server } = req.query as { type: string, server: string };
            if (server?.toLowerCase() !== "nginx") {
                throw new Error("Only Ngnix server is supported")
            }
            if (type) {
                const filePath = SERVER_TYPE_FILE_PATH[server.toUpperCase() as keyof typeof SERVER_TYPE_FILE_PATH].SITES_ENABLED_LOCATION_FILE.replace(":file_name", "")
                const files = AppService.listFilesRecursively(String(filePath)).sort();

                res.json({
                    success: true,
                    message: "Files List",
                    result: files
                }).end();
                return
            }

            const dirPath = req.query.path! || process.cwd();

            const files = AppService.listFilesRecursively(String(dirPath)).sort();

            res.json({
                success: true,
                message: "Files List",
                result: { dir: dirPath, files }
            })
        } catch (error) {
            if (error instanceof Error) {
                res.json({
                    success: true,
                    message: error.message,
                    result: error
                })
                return
            }

            res.json({
                success: false,
                message: "Something went wrong",
                result: null
            })
        }
    }

    async getFileContent(req: Request, res: Response) {
        try {
            const dirPath = req.query.path || '/';
            const fileData = readFileSync(String(dirPath), { encoding: 'utf-8' });

            res.json({
                success: true,
                message: "Opening File Content",
                result: fileData
            })
        } catch (error) {
            if (error instanceof Error) {
                res.json({
                    success: true,
                    message: error.message,
                    result: error
                })
                return
            }

            res.json({
                success: false,
                message: "Something went wrong",
                result: null
            })
        }
    }
    async getServerFileContent(req: Request, res: Response) {
        try {
            const { domain_name, server } = req.query as { domain_name: string, server: string };
            if (server?.toLowerCase() !== "nginx") {
                throw new Error("Only Ngnix server is supported")
            }
            const filePath = SERVER_TYPE_FILE_PATH[server.toUpperCase() as keyof typeof SERVER_TYPE_FILE_PATH].SITES_ENABLED_LOCATION_FILE.replace(":file_name", domain_name)
            const fileData = readFileSync(String(filePath), { encoding: 'utf-8' });

            res.json({
                success: true,
                message: "Opening File Content",
                result: fileData
            })
        } catch (error) {
            if (error instanceof Error) {
                res.json({
                    success: true,
                    message: error.message,
                    result: error
                })
                return
            }

            res.json({
                success: false,
                message: "Something went wrong",
                result: null
            })
        }
    }
    async updateServerFileContent(req: Request, res: Response) {
        try {
            const { domain_name, server } = req.query as { domain_name: string, server: string };
            if (server?.toLowerCase() !== "nginx") {
                throw new Error("Only Ngnix server is supported")
            }
            const filePath = SERVER_TYPE_FILE_PATH[server.toUpperCase() as keyof typeof SERVER_TYPE_FILE_PATH].SITES_ENABLED_LOCATION_FILE.replace(":file_name", domain_name)

            writeFile(String(filePath), req.body.data.content, (err) => {
                if (err) {
                    console.error(err);
                    return
                }
                console.log("first")
            });

            res.json({
                success: true,
                message: "Updated File Content",
                result: {}
            })
        } catch (error) {
            if (error instanceof Error) {
                res.json({
                    success: true,
                    message: error.message,
                    result: error
                })
                return
            }

            res.json({
                success: false,
                message: "Something went wrong",
                result: null
            })
        }
    }
    async sftpUpload(req: Request, res: Response) {
        const sftp = new Client();
        try {
            await sftp.connect({
                host: 'your-sftp-server.com',
                username: 'your-username',
                password: 'your-password'
            });
            await sftp.put('/local/file/path', '/remote/file/path');
            res.json({
                success: true,
                message: "File Uploaded Successfully",
                result: null
            })
        } catch (error) {
            if (error instanceof Error) {
                res.json({
                    success: true,
                    message: error.message,
                    result: error
                })
                return
            }

            res.json({
                success: false,
                message: "Something went wrong",
                result: null
            })
        } finally {
            sftp.end();
        }
    }
}
export default new BaseController();