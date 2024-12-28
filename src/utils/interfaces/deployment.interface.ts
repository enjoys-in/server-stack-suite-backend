import Dockerode from "dockerode"

export interface ApplicationDeployment {
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
  isZipFile: string
  tags: string[]
  selectedBuilder: BuilderOption
  selectedRepo: string
}
export interface FileUploadInfo {
  fileInfo: FileInfo
  appType: AppType
}
export type BuilderOption = "nixpack" | "docker" | "default"
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
  ports: string[]
  tag?: string
  dockerfilePath?: string
  network?: string

}
export interface ApplcationMetadata {
  is_repo_private?: boolean
  is_zip_file?: boolean
  application_deployment_name?: string
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
  DEPLOYED = "DEPLOYED",
  FAILED = "FAILED",
  RUNNING = "RUNNING",
  TERMINATING = "TERMINATING",
  TERMINATED = "TERMINATED",
  STOPPING = "STOPPING",
  POWER_OFF = "POWER_OFF",
}
export enum ApplicationState {
  RUNNING = "RUNNING",
  TERMINATING = "TERMINATING",
  TERMINATED = "TERMINATED",
  STOPPING = "STOPPING",
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
export interface IntegrationMetadata {
  client_id: string;
  client_secret: string;
  redirect_url: string;
  app_id: string;
  webhook_secret: string;
  private_key: string;
  provider: "GITHUB" | "GITLAB" | "BITBUCKET";
  access_type: "SSO" | "TOKEN";
}
export enum IntegrationsProviderCredType {
  TOKEN = "TOKEN",
  SSO = "SSO",
}
export enum IntegrationsProviderType {
  GITHUB = "GITHUB",
  BITBUCKET = "BITBUCKET",
  GITLAB = "GITLAB",
}
export enum Services {
  GITHUB = "GITHUB",
  BITBUCKET = "BITBUCKET",
  GITEA = "GITEA",
  GITLAB = "GITLAB",
  TELEGRAM = "TELEGRAM",
  SLACK = "SLACK",
  AWS = "AWS",
  AZURE = "AZURE",
  CLOUDFLARE = "CLOUDFLARE",
  HEROKU = "HEROKU",
  DIGITAL_OCEAN = "DIGITAL_OCEAN",
}
export type IntegrationsProviderBody = {
  [key in IntegrationsProviderType]: string;

}
export enum IntegrationsType {
  SERVER = "SERVER",
  APP = "APP",
  STORAGE = "STORAGE",
  DATABASE = "DATABASE"
}
type OngoingDeploymentStatus = "build" | "in-progress" | "cancelled" | "failed";
export enum ContainerStatus {
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  EXITED = "EXITED",
}
export enum DeploymentStatus {
  PENDING = "PENDING",
  BUILDING = "BUILDING",
  DEPLOYING = "DEPLOYING",
  STOPPED = "STOPPED",
  ACTIVE = "ACTIVE",
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
}
export interface DeploymentState {
  status: OngoingDeploymentStatus;
  abortController?: AbortController;
}
export interface DockerCreateContainerOptions {
  Image: string
  name: string
  Cmd?: string[]
  ExposedPorts?: { [key: string]: {} }
  Env?: string[]
  WorkingDir?: string
  Healthcheck?: Dockerode.ContainerCreateOptions["Healthcheck"]
  HostConfig: Dockerode.ContainerCreateOptions["HostConfig"]
}