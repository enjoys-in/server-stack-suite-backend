import { Server } from 'socket.io';
import { IUser } from '../interfaces/user.interface';
import { FileHandler } from '../interfaces/fileupload.interface';
 
export type Type<C extends object = object> = new (...args: any) => C;

type Events = "ready" | "error" | "mount";

declare module "express" {
    
    interface Request {
        io?:Server
        user?: IUser;
        isAuthenticated?: boolean;
    }

    interface Application {
        enableHooks?: () => void;
        event?: (event: Events, callback: () => void) => void;
    }
}
export type FileUploadInfo = {
    id: string;
    key: string;
    extenstion: string;
} & FileHandler;