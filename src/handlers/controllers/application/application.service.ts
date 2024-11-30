import { ApplicationEntity } from "@/factory/entities/application.entity";
import { InjectRepository } from "@/factory/typeorm";
import { CreateApplicaionDTO, UpdateApplicaionDTO } from "./dto/application.dto";
import helpers from "@/utils/helpers";
import { DeploymentTrackerEntity } from "@/factory/entities/deploymen_tracker.entity";


const appRepository = InjectRepository(ApplicationEntity);
const appDeploymentEvents = InjectRepository(DeploymentTrackerEntity);

class ApplicationService {
    createNewApplication(data: CreateApplicaionDTO) {

        return appRepository.save({
            application_name: helpers.purifyString(data.application_name),
            application_description: data.application_description,
            framework_preset: data.framework_preset,
            selected_domain: data.selected_domain,
            reverse_proxy: data.reverse_proxy,
            source_type: data.source_type,
            useDockerfile: Boolean(data.useDockerfile),
            docker_metadata: data.docker_metadata,
            environment_variables: data.environment_variables,
            path: data.path,
            commands: data.commands,
            tags: data.tags,
            selectedBuilder: data.selectedBuilder,
            selectedRepo: data.selectedRepo,
            project: {
                id: +data.project.id
            }

        })
    }

    getSingleApplication(id: number) {
        return appRepository.findOne({ where: { id }, relations: ["project"] })
    }
    updateApplicationMetadata(id: number, metadata: UpdateApplicaionDTO) {
        return appRepository.update({ id }, { ...metadata, useDockerfile: Boolean(metadata.useDockerfile) })
    }
    deleteApplication(id: number) {
        return appRepository.delete({ id })
    }
    getApplicationDeploymentEvents(application_id: number) {
        return appDeploymentEvents.find({ where: { application: { id: application_id } } })
    }


}

export default new ApplicationService();
