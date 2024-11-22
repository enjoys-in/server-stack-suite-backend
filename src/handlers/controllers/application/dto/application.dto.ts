import { PartialType } from "@/utils/interfaces";
import { ApplicationDeployment, Commands, EnvironmentVariable, Path } from "@/utils/interfaces/deployment.interface";

export class CreateApplicaionDTO implements ApplicationDeployment {
    project_id!: string;
    project_path!: string;
    application_name!: string;
    application_description!: string;
    framework_preset!: string;
    selected_domain!: string;
    reverse_proxy!: string;
    useDockerFile!: string;
    environment_variables!: EnvironmentVariable[];
    path!: Path;
    commands!: Commands;
    tags!: string[];
    selectedBuilder!: string;
    selectedRepo!: string
}
export class UpdateApplicaionDTO extends PartialType(CreateApplicaionDTO) { }