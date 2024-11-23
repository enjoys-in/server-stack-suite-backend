import { Entity, Column, OneToMany, JoinTable, ManyToOne, Relation } from "typeorm";
import { FileEntity } from "./file.entity";
import { CommonEntity } from "./common";
import { WebhookEntity } from "./webhook.entity";
import { DeploymentLogEntity } from "./deploymentLog.entity";
import { ProjectsEnitity } from "./project.entity";
import { ApplicationDeploymentStatus ,DockerMetadata} from "@/utils/interfaces/deployment.interface";

@Entity()
export class ApplicationEntity extends CommonEntity {


  @Column()
  application_name!: string;

  @Column()
  application_description!: string;

  @Column()
  framework_preset!: string;

  @Column()
  selected_domain!: string;

  @Column()
  reverse_proxy!: string;

  @Column({ type: "json" })
  environment_variables!: { key: string; value: string }[];

  @Column("simple-array")
  tags!: string[];

  @Column({ nullable: true })
  git_url!: string

  @Column("simple-array", { default: [] })
  subdomain!: string

  @Column("simple-array", { default: [] })
  custom_domain!: string
  
  @OneToMany(() => FileEntity, (file) => file.application, { cascade: true })
  files!: FileEntity[];

  @Column()
  selectedBuilder!: string;

  @Column({ default: false })
  useDockerfile!: boolean;

  @Column("jsonb",{nullable:true,default:{}})
  docker_metadata!: DockerMetadata;

  @Column()
  selectedRepo!: string;

  @Column({ enum: ApplicationDeploymentStatus,default:ApplicationDeploymentStatus.PROVISIONING })
  status!: string

  @Column({ type: "json" })
  path!: { main_directory: string; root_directory: string; output_directory: string };

  @Column({ type: "json" })
  commands!: { build_command: string; start_command: string; additional_command: string };

  @OneToMany(() => DeploymentLogEntity, (log) => log.application,{nullable: true})
  logs!: DeploymentLogEntity[];

  @OneToMany(() => WebhookEntity, (webhook) => webhook.applicationId,{nullable: true})
  webhooks!: WebhookEntity[];

  @ManyToOne(() => ProjectsEnitity, (project) => project.applications)
  @JoinTable()
  project!: Relation<ProjectsEnitity>;
}

