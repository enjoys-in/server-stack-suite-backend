 
import * as fs from 'fs';
import { SOCKET_PAYLOAD_TYPE } from '@/utils/interfaces';
import * as path from "path";
import * as unzipper from "unzipper";
import { DEPLOYMENT_DIR } from '@/utils/paths';
 
export class FileOperations {
   async uploadZipFile(fileNameWithPath:string){
    const zipPath = path.resolve(DEPLOYMENT_DIR,  fileNameWithPath);
     
      
   }
    async extractZip(zipPath: string, appName: string): Promise<string> {
        const outputDir = path.resolve(__dirname, "../deployments", appName);
        await fs.mkdirSync(outputDir, { recursive: true });
    
        return new Promise((resolve, reject) => {
          fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: outputDir }))
            .on("close", () => resolve(outputDir))
            .on("error", (err) => reject(err));
        });
      }
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