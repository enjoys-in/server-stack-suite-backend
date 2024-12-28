import { ApplicationEntity } from "@/factory/entities/application.entity";
import { InjectRepository } from "@/factory/typeorm";
import { CreateApplicaionDTO, UpdateApplicaionCommand, UpdateApplicaionDTO } from "./dto/application.dto";
import helpers from "@/utils/helpers";
import { DeploymentTrackerEntity } from "@/factory/entities/deploymen_tracker.entity";
import { FileEntity } from "@/factory/entities/file.entity";
import { FileUploadedInfo } from "@/utils/interfaces/fileupload.interface";
import { HealthcheckEntity } from "@/factory/entities/healthcheck.enitity";


const fileRepoRepository = InjectRepository(FileEntity);
const appRepository = InjectRepository(ApplicationEntity);
const appDeploymentEventsRepository = InjectRepository(DeploymentTrackerEntity);
const healthCheckRepository = InjectRepository(HealthcheckEntity);

class ApplicationService {
    async createNewApplication(data: CreateApplicaionDTO) {
        const saveOptions: any = {
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
            port: data.port,
            commands: data.commands,
            tags: data.tags,
            selectedBuilder: data.selectedBuilder,
            selectedRepo: data.selectedRepo,
            application_id: helpers.SimpleHash().toLocaleLowerCase(),
            project: {
                id: +data.project.id
            }
        }
        if (data.files) {
            const files = data.files as unknown as FileUploadedInfo
            const fileInstance = await fileRepoRepository.save({
                file_name: files.modified_name,
                path: files.uploadPath,
                info: files,

            })
            saveOptions.files = {
                id: fileInstance.id
            }
        }

        return appRepository.save(saveOptions)
    }
    hasSingleApplication(id: number) {
        return appRepository.exists({
            where: { id }
        })
    }
    getSingleApplication(id: number) {
        return appRepository.findOne({ where: { id }, relations: ["project", "containers"] })
    }
    updateApplicationMetadata(id: number, metadata: UpdateApplicaionDTO) {
        if ("useDockerfile" in metadata) {
            metadata = { ...metadata, useDockerfile: Boolean(metadata.useDockerfile) }
        }
        return appRepository.update({ id }, metadata)
    }
    deleteApplication(id: number) {
        return appRepository.delete({ id })
    }
    getApplicationDeploymentEvents(application_id: number) {
        return appDeploymentEventsRepository.find({ where: { application: { id: application_id } } })
    }
    async addApplicationHealthCheck(body: any) {
        const healthCheck = await healthCheckRepository.findOne({ where: { application: { id: body.application_id } } })
        if (healthCheck) {
            return healthCheckRepository.update({
                application: {
                    id: +body.application_id
                },
            }, {
                healthcheck_path: body.healthcheck_path,
                is_active: body.is_active,
            });
        }
        const response = await healthCheckRepository.save({
            healthcheck_path: body.healthcheck_path,
            application: {
                id: +body.application_id
            },
            is_active: body.is_active
        })
        return this.updateApplicationMetadata(+body.application_id, { healthCheck: response })

    }

}

export default new ApplicationService();
