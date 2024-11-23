import { Entity,  Column } from "typeorm";
import { CommonEntity } from "./common";
import { ApplicationDeploymentStatus } from "@/utils/interfaces/deployment.interface";

@Entity()
export class DeploymentLogEntity extends CommonEntity {
  @Column()
  application!: number;

  @Column({ enum: ApplicationDeploymentStatus,default:ApplicationDeploymentStatus.PROVISIONING })
  status!: string 
  
  @Column("text")
  logs!: string;  

  @Column("jsonb",{nullable:true})
  metadata!: any; 

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  timestamp!: Date;

}