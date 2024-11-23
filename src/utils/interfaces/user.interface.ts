import { JwtPayload } from "jsonwebtoken";
 
interface User {
    uid: number;
    name: string;   
    email: string;   
    isFirstLogin: boolean;   
}
export type IUser = User & JwtPayload

export enum USER_STATUS {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BANNED = 'BANNED',
    DELETED = 'DELETED',
    PENDING = 'PENDING',
    SUSPENDED = 'SUSPENDED',
    BLOCKED = 'BLOCKED'
}
export const USER_STATUS_AND_ERROR = {
    [USER_STATUS.INACTIVE]: "Your Account is Not Active,Please Verify Your Email",
    [USER_STATUS.BANNED]: "Your Account is Banned,Please Contact Administrator",
    [USER_STATUS.DELETED]: "No Account With This Email Found",
    [USER_STATUS.PENDING]: "Your Account is Pending,Please Wait For Approval",
    [USER_STATUS.SUSPENDED]: "Your Account is Suspended,Due to violation of Terms and Conditions",
    [USER_STATUS.BLOCKED]: "Your Account is Blocked,Due to Many Failed Login Attempts",
}
export enum AppRoles {
    User = 'USER',
    Admin = 'ADMIN',
    SuperViser = 'SUPERVISER',
    Manager = 'MANAGER',
    SuperAdmin = 'SUPERADMIN',
}
export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}
export enum HOST_STATUS {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    DELETED = 'DELETED'
}
export enum ACCESS_TYPE {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}

export enum HOST_TYPE {
    REDIRECTION = 'REDIRECTION',
    STREAM = 'STREAM',
    PROXY = 'PROXY',
    ERROR_PAGE = 'ERROR_PAGE',

}
export enum SSL_STATUS {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    EXPIRED = "EXPIRED"
}
export enum DEFAULT_STATUS {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DRAFT = 'DRAFT',
    PUBLISH = 'PUBLISH',
}

export enum DASHBOAD_CONFIG {
    PROCESSING = 'PROCESSING',
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    SUSPENDED = 'SUSPENDED',

}

export enum PROCESSORS_QUEUE_NAME {
    EMAIL_PROCESSOR = 'process-email',
    HOST_PROCESSOR = 'process-hosts',


}
export const UserRolesArray = Object.values(AppRoles);
export type AllowedRoles = keyof typeof AppRoles;

 

export interface InterceptorsSettings {
    response: Record<string, any>;
    isEnable?: boolean;
}

export type AuthProviders = {
    [key in AuthProvidersList]: AuthProvidersKeys;
};
export type AuthProvidersScopes = {
    [key in AuthProvidersList]: string[];
};
export interface AuthProvidersKeys {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
}
export type AuthProvidersList = "google" | "facebook" | "github";
