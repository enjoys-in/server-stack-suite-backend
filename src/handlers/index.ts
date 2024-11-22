import {UserAuthController } from "./controllers";
import { HostsService } from "./controllers/hosts/host.service";

export async function onAppStart(){
    UserAuthController.default.onAppStart();
    HostsService.onAppStart()
}