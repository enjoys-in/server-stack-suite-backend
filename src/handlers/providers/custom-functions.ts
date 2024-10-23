import * as os from "os"

export class CustomFunctions{
    async RealTimeUsageData(){
        const nI = os.networkInterfaces()
        const performanceLoadData = ()=> new Promise(async(resolve, reject)=>{
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
          const memUseage = Math.floor(usedMem/totalMem*100)/100; //2 decimal places
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
            freeMem: `${Math.floor(freeMem/1073741824*100)/100} GB`,
            totalMem: `${Math.floor(totalMem/1073741824*100)/100} GB`,
            usedMem: `${Math.floor(usedMem/1073741824*100)/100} GB`,        
            memUseage:`${(memUseage*100).toFixed(2)}%`,
            osType,
            upTime,
            cpuType,
            numCores,
            cpuSpeed,
            cpuLoad,
        }
          resolve(data)
      })
      
        const getCpuLoad = ()=> new Promise((resolve, reject)=>{
          //call cpuAverage for "now"
          const start = cpuAverage(); //"now" value of load
          setTimeout(()=>{
              //call cpuAverage for "end" 100ms after "now"
              const end = cpuAverage(); //"end" value of load
              const idleDiff = end.idle - start.idle;
              const totalDiff = end.total - start.total
              // console.log(idleDiff,totalDiff)
              // calculate the % of the used cpu
              const percentOfCpu = 100 - Math.floor(100 * idleDiff / totalDiff); //%
              resolve(percentOfCpu)
          },100)
      })
        const cpuAverage = ()=>{
          const cpus = os.cpus();
          //cpus is an array of all cores. We need the average of all the cores which
          //will give us the cpu average.
          let idleMs = 0; //idle milliseconds
          let totalMs = 0; //total milliseconds
          //loop through each core (thread)
          cpus.forEach((aCore:any)=>{
              //loop through each property of the current core
              for(let mode in aCore.times){
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
        for(let key in nI){
          const isInternetFacing = !nI[key][0].internal;
          if(isInternetFacing){
              //we have a macA we can use!
              macA = nI[key][0].mac + Math.floor(Math.random()*100000);
              break;
          }
      }
      return {
        macAddress: macA,
        performanceLoadData:await performanceLoadData(),            
        timestamp: new Date(),        
      };
    }
}