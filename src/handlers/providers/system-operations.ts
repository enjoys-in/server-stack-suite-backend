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
  static async executeCommand(command: string, args: string[]): Promise<{ stdout: string, stderr: string }> {
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