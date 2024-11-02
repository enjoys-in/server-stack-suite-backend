 
import * as fs from 'fs';
import { SOCKET_PAYLOAD_TYPE } from '@/utils/interfaces';

 
export class FileOperations {
    constructor() {}

    private messageBody(payload: SOCKET_PAYLOAD_TYPE) {
        const LogDateTime = new Date().toISOString();
        return `${LogDateTime} [${payload.level.toLocaleUpperCase()}] ${payload.message}`;
    }
    readFile(path: string) {
        return fs.readFileSync(path, 'utf8')
    }

    async writeFile(path: string, data: string) {
        return fs.writeFileSync(path, data)
    }

    appendFile(path: string, data: string) {
        return fs.appendFileSync(path, data)
    }

    deleteFile(path: string) {
        return fs.unlinkSync(path)
    }
    checkFileExists(path: string) {
        return fs.existsSync(path)
    }
    changePermission(path: string, permission: number = 0o777) {
        return fs.chmodSync(path, permission)
    }

}