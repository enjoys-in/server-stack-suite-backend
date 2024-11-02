import { ChildProcess, spawn } from 'child_process'



export class SystemOperations {
    run(command: string, args: string[]) {
        let child: ChildProcess
        if (!args) {
            child = spawn(command, args,{ shell: true, stdio: 'inherit', detached: true, });
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
    cmd(command: string, args: string[]) {
        let child: ChildProcess
        if (!args) {
            child = spawn(command, args,{ shell: true, stdio: 'inherit', detached: true, });
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
    
}