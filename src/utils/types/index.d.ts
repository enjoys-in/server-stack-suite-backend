import { FileHandler } from './fileupload.interface';
import { IUser } from './user.interface'

export type Type<C extends object = object> = new (...args: any) => C;

type Events = "ready" | "error" | "mount";

declare module "express" {
    
    interface Request {
        user?: IUser;
        isAuthenticated?: boolean;
    }

    interface Application {
        enableHooks: () => void;
        event: (event: Events, callback: () => void) => void;
    }
}
export type FileUploadInfo = {
    id: string;
    key: string;
    extenstion: string;
} & FileHandler;