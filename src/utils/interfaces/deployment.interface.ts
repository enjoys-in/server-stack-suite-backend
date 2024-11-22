export interface ApplicationDeployment{
  project_id: string
  project_path: string
  application_name: string
  application_description: string
  framework_preset: string
  selected_domain: string
  reverse_proxy: string
  useDockerFile: string
  environment_variables: EnvironmentVariable[]
  path: Path
  commands: Commands
  tags: string[]
  selectedBuilder: string
  selectedRepo: string 
}

export interface EnvironmentVariable {
  key: string
  value: string
}

export interface Path {
  main_directory: string
  root_directory: string
  output_directory: string
}

export interface Commands {
  build_command: string
  start_command: string
  additional_command: string
}

  export enum ApplicationDeploymentStatus {
    PROVISIONING = "PROVISIONING",
    BUILDING = "BUILDING",
    DEPLOYING = "DEPLOYING",
    FAILED = "FAILED",
    SUCCEEDED = "SUCCEEDED",
    RUNNING = "RUNNING",
    TERMINATING = "TERMINATING",
    TERMINATED = "TERMINATED",
    POWER_OFF = "POWER_OFF",
  }