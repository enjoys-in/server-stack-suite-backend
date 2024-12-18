import { Entity,  Column, ManyToOne, Relation } from "typeorm";
import { CommonEntity } from "./common";
import { DeploymentTrackerEntity } from "./deploymen_tracker.entity";

@Entity("deployment_logs")
export class DeploymentLogEntity extends CommonEntity {

  @ManyToOne(() => DeploymentTrackerEntity, (deployment) => deployment.logs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  deployment!: Relation<DeploymentTrackerEntity>;
 
  @Column({default:"info"})
  level!: string;  

  @Column("text")
  log!: string;  

  @Column("jsonb",{nullable:true})
  metadata!: any; 

  @Column()
  timestamp!: string;

}