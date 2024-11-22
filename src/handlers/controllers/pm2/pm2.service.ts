import { Logging } from "@/logs";
import * as pm2 from "pm2";

class PM2Service {
    constructor() {
        pm2.connect(err => {
            if (err) throw err;
            Logging.dev("PM2 connected and ready");
        })

    }
}

export default new PM2Service();
