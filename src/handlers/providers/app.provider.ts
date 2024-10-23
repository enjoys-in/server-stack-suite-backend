import { HostsEnitity } from "@/factory/entities/hosts.entity"
import { SSLCertificatesEnitity } from "@/factory/entities/ssl_certificates.entity"
import { UserEntity } from "@/factory/entities/users.entity"
import { InjectRepository } from "@/factory/typeorm"
import utils from "@/utils"
import { docker } from "@/utils/helpers/docker"
import { Repository } from "typeorm"
import { exec } from 'child_process';
import * as fs from 'fs'
import { InitLogs } from "@/utils/helpers/file-logs"
import { join } from "path"

let idCounter = 1;

class AppService {
    private readonly userRepo: Repository<UserEntity>
    private readonly sslRepo: Repository<SSLCertificatesEnitity>
    private readonly hostRepo: Repository<HostsEnitity>
    constructor() {
        this.userRepo = InjectRepository(UserEntity)
        this.sslRepo = InjectRepository(SSLCertificatesEnitity)
        this.hostRepo = InjectRepository(HostsEnitity)

    }
    async getAnalytics() {
        const containers = await docker.ping().then(async () => {
            return (await docker.listContainers({ all: true })).length
        }).catch(() => {
            return 0
        })
        return {
            totalUsers: await this.userRepo.count(),
            totalHosts: await this.hostRepo.count(),
            totalSslCertificates: await this.sslRepo.count(),
            containers,
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
    listFilesRecursively = (dirPath: string): any[] => {
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
                    isDirectory: false
                };
            });

        return [...directories, ...regularFiles];
    }
}

export default new AppService();