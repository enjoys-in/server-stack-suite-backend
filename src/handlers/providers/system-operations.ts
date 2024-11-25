import { ChildProcess, spawn } from 'child_process'



export class SystemOperations {
    static run(command: string, args: string[]) {
        let child: ChildProcess
        if (!args) {
            child = spawn(command, args, { shell: true, stdio: 'inherit', detached: true, });
        }
        child = spawn(command, { shell: true, stdio: 'inherit' });

        child.on('error', (err) => {
            console.log(err);
        });
        child.stdout!.on('data', (data) => {
            console.log(data);
        });
        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
        child.kill()
        return child
    }
   static async cmd(command: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const process = spawn(command, { shell: true });

            process.stdout.on("data", (data) => {
                resolve(data)
            });

            process.stderr.on("data", (data) => {
                resolve(data)
            });

            process.on("close", (code) => {
                if (code === 0) {                    
                    resolve(code);
                } else {
                    
                    reject(new Error(`Process exited with code ${code}`));
                }
            });
            process.on("error", (err) => {
                reject(err);
            });
        });
    }


}