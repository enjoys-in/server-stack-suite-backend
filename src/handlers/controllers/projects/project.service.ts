import { ProjectsEnitity } from "@/factory/entities/project.entity";
import { InjectRepository } from "@/factory/typeorm";


const projectRepository = InjectRepository(ProjectsEnitity)
class ProjectService {
    createProject(data: any) {

        return projectRepository.save(data);
    }
    getAllProjects() {
        return projectRepository.find();
    }
    getSingleProject(id: number) {
        return projectRepository.findOne({
            where:{
                id
            },
            relations: ["applications"]
        });
    }
    async deleteProject(id: number) {
        try {
            const project = await projectRepository.findOneBy({ id });
            if (!project) {
                throw new Error("Project not found");
            }
            await projectRepository.delete(id);
            return { success: true, message: "Project deleted" };
        } catch (error) {
            throw new Error("Failed to delete project");
        }
    }
}

export default new ProjectService();
