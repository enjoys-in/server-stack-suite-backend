import * as os from "os"
import { readFileSync, existsSync } from "fs";
import path from "path";

type AppType = {
  type: string;
  buildCommand: string;
  serveCommand: string;
};

export class CustomFunctions {
  async RealTimeUsageData() {
    const nI = os.networkInterfaces()
    const performanceLoadData = () => new Promise(async (resolve, reject) => {
      // What do we need to know FROM NODE about performance?
      // - CPU load (current)
      const cpus = os.cpus(); //all cpus as an array
      // - Memory Useage
      // - total
      const totalMem = os.totalmem(); //in bytes
      // - free
      const freeMem = os.freemem(); //in bytes
      // - memory useage
      const usedMem = totalMem - freeMem;
      const memUseage = Math.floor(usedMem / totalMem * 100) / 100; //2 decimal places
      // console.log(totalMem, freeMem,memUseage)
      // - OS type
      const osType = os.type() === 'Darwin' ? 'Mac' : os.type();
      // console.log(osType)
      // - uptime
      const upTime = os.uptime();
      // console.log(upTime)
      // - CPU info
      // -Cpu Type
      const cpuType = cpus[0].model;
      // - Number of cores
      const numCores = cpus.length;
      // - Clock Speed
      const cpuSpeed = cpus[0].speed;
      const cpuLoad = await getCpuLoad();
      const data = {
        freeMem: `${Math.floor(freeMem / 1073741824 * 100) / 100} GB`,
        totalMem: `${Math.floor(totalMem / 1073741824 * 100) / 100} GB`,
        usedMem: `${Math.floor(usedMem / 1073741824 * 100) / 100} GB`,
        memUseage: `${(memUseage * 100).toFixed(2)}%`,
        osType,
        upTime,
        cpuType,
        numCores,
        cpuSpeed,
        cpuLoad,
      }
      resolve(data)
    })

    const getCpuLoad = () => new Promise((resolve, reject) => {
      //call cpuAverage for "now"
      const start = cpuAverage(); //"now" value of load
      setTimeout(() => {
        //call cpuAverage for "end" 100ms after "now"
        const end = cpuAverage(); //"end" value of load
        const idleDiff = end.idle - start.idle;
        const totalDiff = end.total - start.total
        // console.log(idleDiff,totalDiff)
        // calculate the % of the used cpu
        const percentOfCpu = 100 - Math.floor(100 * idleDiff / totalDiff); //%
        resolve(percentOfCpu)
      }, 100)
    })
    const cpuAverage = () => {
      const cpus = os.cpus();
      //cpus is an array of all cores. We need the average of all the cores which
      //will give us the cpu average.
      let idleMs = 0; //idle milliseconds
      let totalMs = 0; //total milliseconds
      //loop through each core (thread)
      cpus.forEach((aCore: any) => {
        //loop through each property of the current core
        for (let mode in aCore.times) {
          //we need all modes for this core added to totalMs
          totalMs += aCore.times[mode];
        }
        //we need idle mode for this core added to idleMs
        idleMs += aCore.times.idle;
      });
      return {
        idle: idleMs / cpus.length,
        total: totalMs / cpus.length,
      }
    }
    let macA; //mac address
    for (let key in nI) {

      if (nI[key]) {
        const isInternetFacing = !nI[key][0].internal;
        if (isInternetFacing) {
          //we have a macA we can use!
          macA = nI[key][0].mac + Math.floor(Math.random() * 100000);
          break;
        }
      }
    }
    return {
      macAddress: macA,
      performanceLoadData: await performanceLoadData(),
      timestamp: new Date(),
    };
  }
  detectApplicationType(projectPath: string): AppType | null {
    const packageJsonPath = path.join(projectPath, "package.json");
    const result: AppType = { type: "unknown", buildCommand: "", serveCommand: "" };

    // Rust detection (using Cargo.toml)
    if (existsSync(path.join(projectPath, "Cargo.toml"))) {
      return {
        type: "Rust",
        buildCommand: "cargo build --release",
        serveCommand: "cargo run",
      };
    }

    // Deno detection
    if (existsSync(path.join(projectPath, "mod.ts")) || existsSync(path.join(projectPath, "main.ts"))) {
      return {
        type: "Deno",
        buildCommand: "N/A (no build step)",
        serveCommand: "deno run --allow-all mod.ts",
      };
    }

    // Read package.json for other project types
    if (!existsSync(packageJsonPath)) {
      console.error("No package.json found in the project directory.");
      return null;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const scripts = packageJson.scripts || {};

    const frameworks = Object.keys(dependencies || {});

    // Use a switch statement to determine the application type
    switch (true) {
      case frameworks.includes("vite"):
        return {
          type: "Vite",
          buildCommand: scripts.build || "vite build",
          serveCommand: scripts.serve || "vite preview",
        };

      case frameworks.includes("@nestjs/core"):
        return {
          type: "NestJS",
          buildCommand: scripts.build || "nest build",
          serveCommand: scripts.start || "nest start",
        };

      case frameworks.includes("vue") || frameworks.includes("vue-loader"):
        return {
          type: "Vue",
          buildCommand: scripts.build || "vue-cli-service build",
          serveCommand: scripts.serve || "vue-cli-service serve",
        };

      case frameworks.includes("@angular/core"):
        return {
          type: "Angular",
          buildCommand: scripts.build || "ng build",
          serveCommand: scripts.start || "ng serve",
        };

      case frameworks.includes("remix") || frameworks.includes("@remix-run/react"):
        return {
          type: "Remix",
          buildCommand: scripts.build || "remix build",
          serveCommand: scripts.start || "remix dev",
        };

      case frameworks.includes("solid") || frameworks.includes("solid-js"):
        return {
          type: "SolidJS",
          buildCommand: scripts.build || "solid-start build",
          serveCommand: scripts.start || "solid-start dev",
        };

      case frameworks.includes("next"):
        return {
          type: "Next.js",
          buildCommand: scripts.build || "next build",
          serveCommand: scripts.start || "next start",
        };

      case frameworks.includes("express"):
        return {
          type: "Express",
          buildCommand: "N/A (no build step)",
          serveCommand: scripts.start || "node index.js",
        };

      case frameworks.includes("fastify"):
        return {
          type: "Fastify",
          buildCommand: "N/A (no build step)",
          serveCommand: scripts.start || "fastify start server.js",
        };

      case frameworks.includes("elysia"):
        return {
          type: "Elysia",
          buildCommand: "N/A (no build step)",
          serveCommand: scripts.start || "node index.js",
        };

      case frameworks.includes("hono"):
        return {
          type: "Hono",
          buildCommand: "N/A (no build step)",
          serveCommand: scripts.start || "node index.js",
        };

      case frameworks.includes("node") || packageJson.engines?.node:
        return {
          type: "Node.js",
          buildCommand: scripts.build || "npm run build",
          serveCommand: scripts.start || "node index.js",
        };

      case packageJson.engines?.bun || existsSync(path.join(projectPath, "bun.lockb")):
        return {
          type: "Bun",
          buildCommand: scripts.build || "bun build",
          serveCommand: scripts.start || "bun run start",
        };

      default:
        return {
          type: "Unknown",
          buildCommand: scripts.build || "N/A",
          serveCommand: scripts.start || "N/A",
        };
    }
  }
}