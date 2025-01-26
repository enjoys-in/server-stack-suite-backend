export enum USER_STATUS {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BANNED = 'BANNED',
    DELETED = 'DELETED',
    PENDING = 'PENDING',
    SUSPENDED = 'SUSPENDED',
    BLOCKED = 'BLOCKED'
}
export enum USER_ROLE {
    GUEST = 'GUEST',
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPERVISER = 'SUPERVISER',
    MANAGER = 'MANAGER',
    SUPERADMIN = 'SUPERADMIN',
}
export const METADATA_KEYS = {
    CRONJOB: Symbol('cronSchedule'),
    FILE_UPLOAD_OPTIONS: Symbol('fileUploadOptions'),
    ABILITY: Symbol('ability')

}
export const RolesArray = Object.values(USER_ROLE);
export const LIFECYCLE_HOOKS_KEY = 'lifecycle:hooks';
export const PUBLIC_ROUTE_KEY = Symbol('publicRoute');
export const ServiceMappings = {
    "serviceId": "service_id",
    "serviceName": "service_name",
    "serviceSlug": "service_slug",
    "imageName": "image_name",
    "serviceDescription": "service_description",
    "serviceType": "service_type",
    "servicePort": "service_port",
    "serviceStatus": "service_status",
    "auth_required": "auth_required",
}