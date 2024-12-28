import { Entity, Column, OneToMany, JoinTable, ManyToOne, Relation, OneToOne } from "typeorm";
import { FileEntity } from "./file.entity";
import { CommonEntity } from "./common";
import { WebhookEntity } from "./webhook.entity";
import { ProjectsEnitity } from "./project.entity";
import { ApplcationMetadata, ApplicationDeploymentStatus, Commands, DockerMetadata, Path } from "@/utils/interfaces/deployment.interface";
import { DeploymentTrackerEntity } from "./deploymen_tracker.entity";
import { ContainerEntity } from "./container.entity";
import { HealthcheckEntity } from "./healthcheck.enitity";

@Entity("applications")
export class ApplicationEntity extends CommonEntity {
  @Column()
  application_name!: string;

  @Column()
  application_description!: string;

  @Column({ default: "" })
  application_id!: string;

  @Column({ nullable: true })
  framework_preset!: string;

  @Column({ nullable: true, default: null, unique: true })
  selected_domain!: string;

  @Column({ nullable: true })
  reverse_proxy!: string;

  @Column({ nullable: true })
  branch!: string;

  @Column({ type: "json" })
  environment_variables!: { key: string; value: string }[];

  @Column("simple-array")
  tags!: string[];

  @Column({ default: "", nullable: true })
  port!: string;

  @Column({ default: "git", enum: ["zip", "git"] })
  source_type!: string

  @Column("simple-array", { default: "", nullable: true })
  custom_domains!: string[]

  @OneToOne(() => FileEntity, (file) => file.application, { cascade: ['remove'], nullable: true })
  file!: FileEntity;

  @Column()
  selectedBuilder!: string;

  @Column({ default: false })
  useDockerfile!: boolean;

  @Column("jsonb", { nullable: true, default: {} })
  docker_metadata!: DockerMetadata;
  
  @Column("jsonb", { nullable: true, default: {} })
  metadata!: ApplcationMetadata;

  @Column()
  selectedRepo!: string;

  @Column({ enum: ApplicationDeploymentStatus, default: ApplicationDeploymentStatus.PROVISIONING })
  status!: string

  @Column({ type: "json" })
  path!: Path;

  @Column({ type: "json" })
  commands!: Commands;

  @Column({default:false})
  is_maintainance_mode!: boolean;

  @Column({ nullable: true })
  maintainance_url!: string;  

  @OneToMany(() => WebhookEntity, (webhook) => webhook.applicationId, { nullable: true, cascade: ['remove'], })
  webhooks!: WebhookEntity[];

  @ManyToOne(() => ProjectsEnitity, (project) => project.applications)
  @JoinTable()
  project!: Relation<ProjectsEnitity>;

  @OneToMany(() => DeploymentTrackerEntity, (webhook) => webhook.application, { nullable: true, cascade: ['remove'], eager: true })
  deployments!: DeploymentTrackerEntity[];

  @OneToMany(() => ContainerEntity, (container) => container.application, { nullable: true, cascade: ['remove'], })
  containers!: ContainerEntity[];

  @OneToOne(() => HealthcheckEntity, (hc) => hc.application, { nullable: true, cascade: ['remove'], })
  healthCheck!: HealthcheckEntity;
}

