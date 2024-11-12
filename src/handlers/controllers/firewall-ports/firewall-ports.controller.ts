import type { Request, Response } from "express";
import { FirewallsPortsService } from "./firewalls-ports.service";
import { COMMANDS } from "@/utils/paths";
import { promisify } from "util";
import { exec } from "child_process";
import { EVENT_CONSTANTS } from "@/utils/helpers/events.constants";
import { AppEvents } from "@/utils/services/Events";
import helpers from "@/utils/helpers";

const execAsync = promisify(exec);
const firewallsPortsService = new FirewallsPortsService();
class FirewallPortsController {
    
    async findAll(req: Request, res: Response) {
        try {
            const getFirewallPorts = COMMANDS.BASIX.FIREWALL.RUNNING_PORTS           
            const { stderr, stdout } = await execAsync(getFirewallPorts);
            if (stderr) {
                throw new Error(stderr)
            }
            
            res.json({
                success: true,
                message: "Firewall Ports",
                result: await firewallsPortsService.parseProcessList(stdout)
            });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async killPort(req: Request, res: Response) {
        try {
            const port = req.params.port as string;
            if (!port) {
                throw new Error("port is required")
            }
            AppEvents.emit(EVENT_CONSTANTS.LOGS.INFO, `Killing port ${port}`)
            const getPIDcmd = COMMANDS.BASIX.FIREWALL.KILL_FROM_PROCCESS_ID.replace("{port}", port)
            const { stderr, stdout } = await execAsync(getPIDcmd);
            if (stderr) {
                throw new Error(stderr)
            }
            if (stdout.trim()) {
                throw new Error("There is no process running with this Process ID")
            }

            AppEvents.emit(EVENT_CONSTANTS.INIT.DONE, `Port ${port} has been killed`)
            res.json({
                success: true,
                message: `Port ${port} has been killed`,
                result: {},
            });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    async killProcess(req: Request, res: Response) {
        try {
            const pid = req.params.pid as string;

            if (!pid) {
                throw new Error("Process Id is required")
            }
            const getKillPortCmd = COMMANDS.BASIX.FIREWALL.KILL_PORT.replace("{pid}", pid)
            const { stderr: getKillPortCmdErr, stdout: getKillPortCmdOut } = await execAsync(getKillPortCmd);
            if (getKillPortCmdErr) {
                throw new Error(getKillPortCmdErr)
            }
            AppEvents.emit(EVENT_CONSTANTS.INIT.DONE, `Process Running with PID ${pid} has been killed`)
            res.json({ message: `Process Running with PID ${pid} has been killed`, result: {}, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async manageFirewall(req: Request, res: Response) {
        const payload = req.body;

        try {
            const payload = req.body;
            AppEvents.emit(EVENT_CONSTANTS.LOGS.ERROR, `Checking firewall status for ${payload.value}`)
            let cmd: string;
            switch (payload.type) {
                case "enable":
                    cmd = COMMANDS.BASIX.FIREWALL.ENABLE
                    break;
                case "disable":
                    cmd = COMMANDS.BASIX.FIREWALL.DISABLE
                    break

                case "status":
                    cmd = COMMANDS.BASIX.FIREWALL.GET_STATUS
                    break
                case "profiles":
                    cmd = COMMANDS.BASIX.FIREWALL.AVIALABLE_APPLICATION_PROFILES
                    break
                default:
                    throw new Error("Invalid type")

            }
            const { stderr, stdout } = await execAsync(cmd)
            if (stderr) {
                AppEvents.emit(EVENT_CONSTANTS.LOGS.ERROR, `Error while checking firewall ${payload.type} for ${payload.value} ,. ${stderr}`)
                throw new Error(stderr)
            }
            AppEvents.emit(EVENT_CONSTANTS.LOGS.ERROR, `Error while checking firewall ${payload.type} for ${payload.value} ,. ${stderr}`)
            res.json({ message: `Done`, result: {}, success: true });

        } catch (error: any) {
            AppEvents.emit(EVENT_CONSTANTS.INIT.NOTIFICATION, `Error while checking firewall ${payload.type}  for ${payload.value} ,.  ${error.message}`)

            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
    async managePort(req: Request, res: Response) {
        const payload = req.body;
        try {
            let cmd: string;
            switch (payload.type) {
                case "allow_from_ip":
                    cmd = COMMANDS.BASIX.FIREWALL.ALLOW_FROM_IP.replace("{ip}", payload.value)
                    break;
                case "allow_port":
                    cmd = COMMANDS.BASIX.FIREWALL.ALLOW_PORT.replace("{port}", payload.value)
                    break
                case "deny_from_ip":
                    cmd = COMMANDS.BASIX.FIREWALL.DENY_FROM_IP.replace("{ip}", payload.value)
                    break
                case "delete_ufw_rule":
                    cmd = COMMANDS.BASIX.FIREWALL.DELETE.replace("{port}", payload.value)
                    break
                case "delete_allow_from":
                    cmd = COMMANDS.BASIX.FIREWALL.DELETE_FROM_ALLOW_IP.replace("{ip}", payload.value)
                    break
                case "OpenSSH":
                    cmd = COMMANDS.BASIX.FIREWALL.ALLOW_PORT.replace("{ip}", `"OpenSSH"`)
                    break
                case "Nginx HTTPS":
                    cmd = COMMANDS.BASIX.FIREWALL.ALLOW_PORT.replace("{ip}", `"Nginx HTTPS"`)
                    break
                case "Nginx HTTP":
                    cmd = COMMANDS.BASIX.FIREWALL.ALLOW_PORT.replace("{ip}", `"Nginx HTTP"`)
                    break
                case "Nginx Full":
                    cmd = COMMANDS.BASIX.FIREWALL.ALLOW_PORT.replace("{ip}", `"Nginx Full"`)
                    break

                default:
                    throw new Error("Invalid type")
                    break;
            }
            const { stderr, stdout } = await execAsync(cmd)
            if (stderr) {
                AppEvents.emit(EVENT_CONSTANTS.LOGS.ERROR, `Error while Managing Ports ${helpers.sentenceCase(payload.type)} for ${payload.value} ,. ${stderr}`)
                throw new Error(stderr)
            }

            res.json({ message: `Done`, result: stdout, success: true });

        } catch (error: any) {
            AppEvents.emit(EVENT_CONSTANTS.INIT.NOTIFICATION, `Error while Managing Ports ${helpers.sentenceCase(payload.type)}  for ${payload.value} ,.  ${error.message}`)

            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

}
export default new FirewallPortsController()