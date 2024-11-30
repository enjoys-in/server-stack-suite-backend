import { ApplicationEntity } from "@/factory/entities/application.entity";
import { DeploymentTrackerEntity } from "@/factory/entities/deploymen_tracker.entity";
import { FileEntity } from "@/factory/entities/file.entity";
import { ProjectsEnitity } from "@/factory/entities/project.entity";
import { WebhookEntity } from "@/factory/entities/webhook.entity";
import { PartialType } from "@/utils/interfaces";
import { Commands, EnvironmentVariable, Path, DockerMetadata } from "@/utils/interfaces/deployment.interface";

export class CreateApplicaionDTO extends PartialType(ApplicationEntity) { 
    application_name!: string;
    application_description!: string;
    framework_preset!: string;
    selected_domain!: string;
    branch!: string;
    files?: FileEntity[] | undefined;
    source_type!: string
    custom_domains?: string[] | undefined;
    project!: ProjectsEnitity;
    deployment_events?: DeploymentTrackerEntity[] | undefined;
    webhooks?: WebhookEntity[] | undefined;
    status?: string | undefined;
    reverse_proxy!: string;
    port!: string;
    useDockerfile!: boolean;
    docker_metadata!: DockerMetadata;
    environment_variables!: EnvironmentVariable[];
    path!: Path;
    commands!: Commands;
    tags!: string[];
    selectedBuilder!: string;
    selectedRepo!: string
}
export class UpdateApplicaionDTO extends PartialType(CreateApplicaionDTO) { }