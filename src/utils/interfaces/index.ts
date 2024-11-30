export * from './createHost.interface';
export * from './createNewSSL.interface';

export enum SERVER_TYPE {
    NGINX = "nginx",
    APACHE = "apache",
    HTTPD = "httpd",
    CADDY = "caddy",
    ALL = "all"
}
export type SERVER_TYPES =  Lowercase<keyof typeof SERVER_TYPE>
export type LOGS_LEVEL_TYPES = "info" | "error" | "warn"|"debug" | "log" 
export type SOCKET_PAYLOAD_TYPE = {
    level: LOGS_LEVEL_TYPES
    message: string
}
export interface SOCKET_PAYLOAD_FOR_FIREWALL {
    type: "enable" | "disable" | "status" |"profiles"
    value:string
}
export interface SOCKET_PAYLOAD_FOR_PORT {
    type: "allow_port" | "delete_ufw_rule" | "allow_from_ip" | "deny_from_ip" | "delete_allow_from" | "OpenSSH" | "Nginx HTTPS" | "Nginx HTTP" | "Nginx Full"
    value:string
}

export type WEBHOOK_PROVIDER =  "discord" | "telegram" | "slack" | "microsoftteams" | "whatsapp" 

export function PartialType<T>(BaseClass: new () => T): new () => Partial<T> {
    abstract class PartialClassType {}
    Object.assign(PartialClassType.prototype, BaseClass.prototype);
    return PartialClassType as new () => Partial<T>;
  }
  