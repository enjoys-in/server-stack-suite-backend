export interface ApplicationDeployment{
  project_id: string
  project_path: string
  application_name: string
  application_description: string
  framework_preset: string
  selected_domain: string
  reverse_proxy: string
  docker_metadata: DockerMetadata
  useDockerfile: string
  ports: string[]
  environment_variables: EnvironmentVariable[]
  path: Path
  fileInfo?: FileUploadInfo
  commands: Commands
  isZipFile:string
  tags: string[]
  selectedBuilder: string
  selectedRepo: string 
}
export interface FileUploadInfo {
  fileInfo: FileInfo
  appType: AppType
}

export interface FileInfo {
  file_id: string
  key: string
  extenstion: string
  name: string
  modified_name: string
  size: number
  encoding: string
  tempFilePath: string
  truncated: boolean
  mimetype: string
  md5: string
  file_path: string
}

export interface AppType {
  type: string
  buildCommand: string
  serveCommand: string
}

export interface EnvironmentVariable {
  key: string
  value: string
}
export interface DockerMetadata {
  ports:string[]
  tag?:string
  dockerfilePath?:string
  network?:string

}

export interface Path {
  main_directory: string
  root_directory: string
  output_directory: string
}

export interface Commands {
  build_command: string
  start_command: string
  install_command: string
}

  export enum ApplicationDeploymentStatus {
    PROVISIONING = "PROVISIONING",
    BUILDING = "BUILDING",
    DEPLOYING = "DEPLOYING",
    FAILED = "FAILED",
    ACTIVE = "ACTIVE",
    RUNNING = "RUNNING",
    TERMINATING = "TERMINATING",
    TERMINATED = "TERMINATED",
    POWER_OFF = "POWER_OFF",
  }
  export enum WebhookStatus {
    PROVISIONING = "application:provisioning",
    BUILDING = "application:building",
    DEPLOYING = "application:deploying",  
    READY = "application:ready",
    FAILED = "application:failed",
    DELETED = "application:deleted",
    RESOLVED = "application:resolved",
    UPDATED = "application:updated",
    STARTED = "application:started",
    STOPPED = "application:stopped",  
    TERMINATED = "application:terminated",
    POWER_OFF = "application:power_off",
  }
  export interface DeploymentOptions {
    type: "nixpack" | "docker" | "zip";
    appName: string;
    repoUrl?: string; // Required for nixpack or docker
    dockerfilePath?: string; // Required for docker
    zipFilePath?: string; // Required for zip
    buildCommand?: string; // Optional build command for nixpack
    startCommand: string; // Start command for all methods
}
export interface DeploymentResult {
    success: boolean;
    message: string;
}
type OngoingDeploymentStatus = "build" | "in-progress" | "cancelled"|"failed";

export interface DeploymentState {
  status: OngoingDeploymentStatus;
  abortController?: AbortController;
}
