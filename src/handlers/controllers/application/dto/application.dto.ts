import { PartialType } from "@/utils/interfaces";
import { ApplicationDeployment, Commands, EnvironmentVariable, Path,DockerMetadata } from "@/utils/interfaces/deployment.interface";

export class CreateApplicaionDTO implements ApplicationDeployment {
    project_id!: string;
    project_path!: string;
    application_name!: string;
    application_description!: string;
    framework_preset!: string;
    selected_domain!: string;
    isZipFile!: string;
    reverse_proxy!: string;
    useDockerfile!: string;
    docker_metadata!: DockerMetadata;
    environment_variables!: EnvironmentVariable[];
    path!: Path;
    commands!: Commands;
    tags!: string[];
    selectedBuilder!: string;
    selectedRepo!: string
}
export class UpdateApplicaionDTO extends PartialType(CreateApplicaionDTO) { }