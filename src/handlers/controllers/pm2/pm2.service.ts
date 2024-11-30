import { LogsProvider } from "@/handlers/providers/logs.provider";
import { Logging } from "@/logs";
// import * as pm2 from "pm2";
const logService = new LogsProvider()

class PM2Service {
    // constructor() {
    //     pm2.connect(err => {
    //         if (err) throw err;
    //         Logging.dev("PM2 connected and ready");
    //     })

    // }
    // listofAllApp() {
    
    //     return pm2.list((err) => { })
    // }
    // restartApp(id = "all", callback: (err: any) => void) {
    //     return pm2.restart(id, callback)
    // }
    // stopApp(id = "all", callback: (err: any) => void) {
    //     return pm2.stop(id, callback)
    // }
    // startApp(options: pm2.StartOptions, callback: (err: any) => void) {
    //     return pm2.start(options, callback)
    // }
    // startupApp(id = "all", callback: (err: any) => void) {        
    //     return pm2.startup("ubuntu", callback)
    // }
  
}

export default new PM2Service();
