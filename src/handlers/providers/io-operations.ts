 
import * as fs from 'fs';
import { SOCKET_PAYLOAD_TYPE } from '@/utils/interfaces';
import * as path from "path";
import * as unzipper from "unzipper";
import { DEPLOYMENT_DIR } from '@/utils/paths';
 
/**
 * Class for handling various file operations including uploading, extracting, reading, writing, appending, 
 * deleting, checking existence, and changing permissions of files. 
 * 
 * Methods:
 * - uploadZipFile: Uploads a zip file to a specified directory.
 * - extractZip: Extracts a zip file to a specified output directory.
 * - messageBody: Formats a log message with a timestamp and log level.
 * - readFile: Reads the content of a file synchronously.
 * - writeFile: Writes data to a file synchronously.
 * - appendFile: Appends data to a file synchronously.
 * - deleteFile: Deletes a file synchronously.
 * - checkFileExists: Checks if a file exists.
 * - changePermission: Changes the permission of a file.
 */
export class FileOperations {
   async uploadZipFile(fileNameWithPath:string){
    const zipPath = path.resolve(DEPLOYMENT_DIR,  fileNameWithPath);
     
      
   }
   /**
     * Extracts the contents of a ZIP file to a specified output directory.
     * 
     * @param zipPath - The path to the ZIP file to be extracted.
     * @param outputDir - The directory where the contents of the ZIP file will be extracted.
     * @returns A promise that resolves with the output directory path upon successful extraction.
     * @throws An error if the extraction process fails.
     */
    async extractZip(zipPath: string, outputDir: string,cb?:(msg:string)=>void): Promise<string> {      
        fs.mkdirSync(outputDir, { recursive: true });
    
        return new Promise((resolve, reject) => {
             fs.createReadStream(zipPath)
              .pipe(unzipper.Parse())
              .on("entry", (entry) => {
                const filePath = `Extracting: ${outputDir}/${entry.path}`;
           
                
                if (cb) cb(filePath);
                if (entry.type === "Directory") {
                  fs.mkdirSync(filePath, { recursive: true });
                  entry.autodrain();
                } else {
                  entry.pipe(fs.createWriteStream(filePath));
                }
              })
              .on("close", () => {                
                resolve(outputDir);
              })
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