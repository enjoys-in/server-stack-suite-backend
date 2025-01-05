import { ChildProcess, execSync, spawn } from 'child_process'



export class SystemOperations {
  static isPackageInstalled(command: string) {
    try {
      execSync(`${command} --version`, { stdio: "ignore" });
      return true;
    } catch (error) {
      return false;
    }
  };

  static run(command: string, args: string[] | null) {
    let child: ChildProcess
    return new Promise((resolve, reject) => {
      let result;
      if (args) {
        child = spawn(command, args, { shell: true, stdio: 'inherit', detached: true, });
      }
      else {
        child = spawn(command, { shell: true, stdio: 'inherit' });
      }

      child.on('error', (err) => {
        reject(err);
      });
      child.stdout!.on('data', (data) => {

        resolve(data.toString());
      });
      child.on('close', (code) => {
        if (code === 0) {
          child.kill()
        } else {
          child.kill()
          reject(new Error(`Process exited with code ${code}`));
        }

      });

    })
  }
  static async executeCommand(command: string, args?: string[]): Promise<{ stdout: string, stderr: string }> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { shell: true, });

      let stdoutData: string[] = [];
      let stderrData: string[] = [];

      process.stdout.on("data", (data) => {
        stdoutData.push(data.toString());
      });

      process.stderr.on("data", (data) => {
        stderrData.push(data.toString());
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout: stdoutData.join(""), stderr: stderrData.join("") });
        } else {
          reject(new Error(`Process exited with code ${code}, stderr: ${stderrData.join("")}`));
        }
      });
      process.on("error", (err) => {
        reject(err);
      });
    });
  }


}