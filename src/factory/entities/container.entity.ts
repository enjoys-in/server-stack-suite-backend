import { Column, Entity, JoinColumn, ManyToOne, Relation } from "typeorm";
import { CommonEntity } from "./common";
import { ApplicationEntity } from "./application.entity";
import { DeploymentTrackerEntity } from "./deploymen_tracker.entity";
import { ContainerStatus } from "@/utils/interfaces/deployment.interface";



@Entity("containers")
export class ContainerEntity extends CommonEntity {
    @Column()
    name!: string;

    @Column({ default: false, })
    is_primary!: boolean;

    @Column({enum:ContainerStatus})
    container_status!: string;  

    @Column()
    deployment_id!: number;

    @ManyToOne(() => ApplicationEntity, (application) => application.containers, {
      onDelete: "CASCADE",
      })
    @JoinColumn()
    application!: Relation<ApplicationEntity>;

    @ManyToOne(() => DeploymentTrackerEntity, (deployment) => deployment.containers, {
      onDelete: "CASCADE",     
      })
    @JoinColumn()
    deployment!: Relation<DeploymentTrackerEntity>;

    @Column()
    image!: string;
 

    @Column("jsonb")
    metadata!: object

    @Column({ nullable: true })
    started_at!: string;

    @Column({ nullable: true })
    stopped_at!: string;
}

