import { HostsEnitity } from "@/factory/entities/hosts.entity"
import { SSLCertificatesEnitity } from "@/factory/entities/ssl_certificates.entity"
import { UserEntity } from "@/factory/entities/users.entity"
import { InjectRepository } from "@/factory/typeorm"
import utils from "@/utils"
import { Repository } from "typeorm"
import { exec } from 'child_process';
import * as fs from 'fs'
import { InitLogs } from "@/utils/helpers/file-logs"
import {  extname, join } from "path"
import { ContainerEntity } from "@/factory/entities/container.entity"
import { SYSTEMCTL } from "@/utils/paths"
import { readdir, stat } from "fs/promises"

let idCounter = 1;
type ServiceInfo = {
    unit: string;
    description: string;
    sub: string;
    active: string;
    pid?: number;
    tasks?: number;
    memory?: string;
};
interface SystemdServiceFile {
    id: number;
    name: string;
    path: string;
    isDirectory: boolean;
    children?: Child[] | [];
}

interface Child {
    id: number;
    name: string;
    path: string;
    isDirectory: boolean;
}
class AppService {
    private readonly userRepo: Repository<UserEntity>
    private readonly sslRepo: Repository<SSLCertificatesEnitity>
    private readonly hostRepo: Repository<HostsEnitity>
    private readonly containerRepo: Repository<ContainerEntity>
    constructor() {
        this.userRepo = InjectRepository(UserEntity)
        this.sslRepo = InjectRepository(SSLCertificatesEnitity)
        this.hostRepo = InjectRepository(HostsEnitity)
        this.containerRepo = InjectRepository(ContainerEntity)

    }
    async getAnalytics() {

        return {
            totalUsers: await this.userRepo.count(),
            totalHosts: await this.hostRepo.count(),
            totalSslCertificates: await this.sslRepo.count(),
            containers: await this.containerRepo.count(),
        }
    }
    async create(createUserDto: any): Promise<UserEntity> {
        return this.userRepo.save(createUserDto)
    }
    async update(updateUserDto: Partial<any>): Promise<UserEntity> {
        return this.userRepo.save(updateUserDto)
    }
    async changePassword(email: string, password: string) {
        return this.userRepo.update({ email }, {
            password: await utils.HashPassword(password),
        })
    }
    async listSystemdServices(): Promise<any> {
        return new Promise((resolve, reject) => {
            exec(SYSTEMCTL.LIST, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }

                const services = stdout
                    .split("\n")
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => {
                        line = line.startsWith("●") ? line.slice(1).trim() : line;

                        const parts = line.split(/\s+/); // Splitting by whitespace

                        const unit = parts[0]; // UNIT (service name)
                        const load = parts[1]; // LOAD (loaded/not-found)
                        const active = parts[2]; // ACTIVE (active/inactive)
                        const sub = parts[3]; // SUB (running/exited/dead)
                        const description = parts.slice(4).join(" "); // Remaining part is DESCRIPTION

                        return { unit, load, active, sub, description };
                    });

                resolve(services);
            });
        });
    };
    execute(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout) => {

                if (error) {
                    InitLogs(`Executing Command  ${command} and caught an error is \n${error}`)
                    return reject(error);
                }
                InitLogs(`Executing Command  ${command} and Result is \n ${stdout}`)
                resolve(stdout)
            }
            )
        })
    }
    checkCommand = (command: string, name: string) => {
        return new Promise((resolve) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    InitLogs(`Executing Command  ${command} and caught an error is ${error}`)

                    // If the command fails (e.g., service not installed), return "Not Installed"
                    resolve({ name, value: 'Not Installed' });
                } else {
                    InitLogs(`Executing Command  ${command} and Result is ${stdout}`)

                    // If no error, capture the output from either stdout or stderr
                    const result = stdout.trim() || stderr.trim();
                    resolve({ name, value: `Installed: ${result}` });
                }
            });
        });
    };
    async init(data: any): Promise<any> {
        if (data.pg_db_enabled) {
            const env = fs.readFileSync('../.env', 'utf8');
            // sever.config.json
            const envTemplate = `
                        DBHOST = ${data.pg_db_config.DBHOST}
                        DBNAME = ${data.pg_db_config.DBNAME}
                        DBUSER = ${data.pg_db_config.DBUSER}
                        DBPASS = ${data.pg_db_config.DBPASS}
                        DBPORT = ${data.pg_db_config.DBPORT}
                        DIALECT= ${data.pg_db_config.DIALECT}
        `
            env.replace('DBHOST = localhost', `DBHOST=${data.pg_db_config.DBHOST}`);
            env.replace('DBNAME = serverstacksuite', `DBHOST=${data.pg_db_config.DBNAME}`);
            env.replace('DBUSER = postgres', `DBHOST=${data.pg_db_config.DBUSER}`);
            env.replace('DBPASS = postgres', `DBHOST=${data.pg_db_config.DBPASS}`);
            env.replace('DBPORT = 5432', `DBHOST=${data.pg_db_config.DBPORT}`);
            env.replace('DIALECT= postgres', `DBHOST=${data.pg_db_config.DIALECT}`);
            fs.writeFileSync('../.env', env);
        }

        // return this.adiminRepo.insert({
        //   name: data.name,
        //   username: data.name,
        //   email: data.email,
        //   password: await this.helpers.hashPassword(data.password)
        // });
    }
    test() {
        return this.userRepo.find()
    }
    parseSystemdServiceOutput(output: string): ServiceInfo | null {

        const lines = output.split("\n").map(line => line.trim()).filter(line => line);

        if (lines.length === 0) return null;

        const unitMatch = lines[0].match(/● (\S+) - (.+)/);
        const loadedMatch = output.match(/Loaded:\s+([^()]+)\s+\(([^)]+)\)/);
        const activeMatch = output.match(/Active:\s+(\S+ \(\S+\))/);
        const pidMatch = output.match(/Main PID:\s+(\d+)/);
        const tasksMatch = output.match(/Tasks:\s+(\d+)/);
        const memoryMatch = output.match(/Memory:\s+([\d.]+\S+)/);

        return {
            unit: unitMatch ? unitMatch[1] : "",
            description: unitMatch ? unitMatch[2] : "",
            sub: loadedMatch ? loadedMatch[1].trim() : "",
            active: activeMatch ? activeMatch[1].trim() : "",
            pid: pidMatch ? parseInt(pidMatch[1], 10) : undefined,
            tasks: tasksMatch ? parseInt(tasksMatch[1], 10) : undefined,
            memory: memoryMatch ? memoryMatch[1] : undefined,
        };
    }
    listFilesRecursively = (dirPath: string): SystemdServiceFile[] => {
        try {
            const files: fs.Dirent[] = fs.readdirSync(dirPath, { withFileTypes: true });

            const directories = files
                .filter(file => file.isDirectory() && file.name !== 'node_modules') // Exclude node_modules
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(file => {
                    const fullPath = join(dirPath, file.name);
                    return {
                        id: idCounter++, // Use and increment the counter
                        name: file.name,
                        path: fullPath,
                        isDirectory: true,
                        extenstion:null,
                        children: this.listFilesRecursively(fullPath) // Recursive call for directories
                    };
                });

            const regularFiles = files
                .filter(file => !file.isDirectory())
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(file => {
                    const fullPath = join(dirPath, file.name);
                    return {
                        id: idCounter++, // Use and increment the counter
                        name: file.name,
                        path: fullPath,
                        isDirectory: false,
                        extenstion:extname(file.name),
                    };
                });

            return [...directories, ...regularFiles];
        } catch (error) {
            throw error
        }
    }
    async getServiceFiles() {
        const stdout = await this.execute(SYSTEMCTL.LIST_SERVICES)
        return stdout
            .split("\n")
            .map((line) => line.replace("FragmentPath=", "").trim())
            .filter((path) => path.length > 0);
    }
}

export default new AppService();