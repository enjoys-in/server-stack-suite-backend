import { Entity, Column, OneToMany, JoinTable, ManyToOne, Relation  } from "typeorm";
import { FileEntity } from "./file.entity";
import { CommonEntity } from "./common";
import { WebhookEntity } from "./webhook.entity";
import { DeploymentLogEntity } from "./deploymentLog.entity";
import { ProjectsEnitity } from "./project.entity";
import { ApplicationDeploymentStatus, Commands, DockerMetadata, Path } from "@/utils/interfaces/deployment.interface";
import { DeploymentTrackerEntity } from "./deploymen_tracker.entity";

@Entity("applications")
export class ApplicationEntity extends CommonEntity {
  @Column()
  application_name!: string;

  @Column()
  application_description!: string;

  @Column({ nullable: true })
  framework_preset!: string;

  @Column({ nullable: true,default:null,unique: true })
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

  @Column({ default: "git",enum:[ "zip", "git" ] })
  source_type!: string  

  @Column("simple-array", { default: "",  nullable: true})
  custom_domains!: string[]

  @OneToMany(() => FileEntity, (file) => file.application, { cascade: ['remove'], nullable: true })
  files!: FileEntity[];

  @Column()
  selectedBuilder!: string;

  @Column({ default: false })
  useDockerfile!: boolean;

  @Column("jsonb", { nullable: true, default: {} })
  docker_metadata!: DockerMetadata;

  @Column()
  selectedRepo!: string;

  @Column({ enum: ApplicationDeploymentStatus, default: ApplicationDeploymentStatus.PROVISIONING })
  status!: string

  @Column({ type: "json" })
  path!: Path;

  @Column({ type: "json" })
  commands!: Commands;

  @OneToMany(() => DeploymentLogEntity, (log) => log.application, { nullable: true, cascade: ['remove'], })
  logs!: DeploymentLogEntity[];

  @OneToMany(() => WebhookEntity, (webhook) => webhook.applicationId, { nullable: true })
  webhooks!: WebhookEntity[];

  @ManyToOne(() => ProjectsEnitity, (project) => project.applications)
  @JoinTable()
  project!: Relation<ProjectsEnitity>;

  @OneToMany(() => DeploymentTrackerEntity, (webhook) => webhook.application, { nullable: true })
  deployment_events!: DeploymentTrackerEntity[];
}

