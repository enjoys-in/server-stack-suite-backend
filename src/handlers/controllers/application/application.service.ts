import { ApplicationEntity } from "@/factory/entities/application.entity";
import { InjectRepository } from "@/factory/typeorm";
import { CreateApplicaionDTO, UpdateApplicaionDTO } from "./dto/application.dto";

 
 const appRepository = InjectRepository(ApplicationEntity);

class ApplicationService {
    createNewApplication(data:CreateApplicaionDTO) {
         return appRepository.save({
            application_name: data.application_name,
             application_description: data.application_description,
             framework_preset: data.framework_preset,
             selected_domain: data.selected_domain,
             reverse_proxy: data.reverse_proxy,
             useDockerFile: data.useDockerfile,
             environment_variables: data.environment_variables,
             path: data.path,
             commands: data.commands,
             tags: data.tags,
             selectedBuilder: data.selectedBuilder,
             selectedRepo: data.selectedRepo,
             project:{
                id: +data.project_id
             }

         })
     }
     
    getSingleApplication(id:number) {
        return appRepository.findOne({ where:{id}  })
    }
    updateApplicationMetadata(id:number, metadata: UpdateApplicaionDTO) {
        return appRepository.update({id}, {...metadata,useDockerfile:Boolean(metadata.useDockerfile)})
    }
    deleteApplication(id:number) {
        return appRepository.delete({id})
    }
}

export default new ApplicationService();
