import { Column, Entity, ManyToOne, } from "typeorm";
import { CommonEntity } from "./common";
import { ApplicationEntity } from "./application.entity";

@Entity("deployment_tracker")
export class DeploymentTrackerEntity extends CommonEntity {

    @ManyToOne(() => ApplicationEntity, (application) => application.logs, {
        onDelete: 'SET NULL',
        nullable: true,
      })
      application!: ApplicationEntity|null;
   

    @Column({ enum: ["idle", "in-progress", "cancelled"], default: "idle" })
    status!: string;

    @Column()
    started_at!: string;

    @Column({ default: "" })
    ended_at!: string;
}