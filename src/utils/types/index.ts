import { EVENT_CONSTANTS } from '../helpers/events.constants';

export * from './createHost.interface';
export * from './createNewSSL.interface';

export type SERVER_TYPES = "nginx" | "apache" | "httpd" | "caddy"
export enum SERVER_TYPE {
    NGINX = "nginx",
    APACHE = "apache",
    HTTPD = "httpd",
    CADDY = "caddy",
}
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