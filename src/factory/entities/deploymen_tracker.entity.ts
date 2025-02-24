import { Column, Entity, ManyToOne, OneToMany, Relation, } from "typeorm";
import { CommonEntity } from "./common";
import { ApplicationEntity } from "./application.entity";
import { DeploymentLogEntity } from "./deploymentLog.entity";
import { DeploymentStatus } from "@/utils/interfaces/deployment.interface";
import { ContainerEntity } from "./container.entity";

@Entity("deployments")
export class DeploymentTrackerEntity extends CommonEntity {

  @Column({ unique: true })
  deployment_id!: string;

  @ManyToOne(() => ApplicationEntity, (application) => application.deployments, {
    onDelete: "CASCADE",
    nullable: true,
  })
  application!: Relation<ApplicationEntity>;

  @Column({ nullable: true, default: null })
  container_name!: string;

  @Column({ enum: DeploymentStatus, default: DeploymentStatus.PENDING })
  status!: string;

  @OneToMany(() => ContainerEntity, (container) => container.deployment)
  containers!: ContainerEntity[];

  @Column()
  started_at!: string;

  @OneToMany(() => DeploymentLogEntity, (log) => log.deployment, { nullable: true, cascade: ['remove'], })
  logs!: DeploymentLogEntity[];

  @Column({ default: "" })
  ended_at!: string;


  stopDeployment() {
    this.status = DeploymentStatus.STOPPED;
  }
}