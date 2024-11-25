import { Entity,  Column } from "typeorm";
import { CommonEntity } from "./common";

@Entity()
export class DeploymentLogEntity extends CommonEntity {
  @Column({})
  application!: number;
 
  @Column({default:"info"})
  level!: string;  

  @Column("text")
  log!: string;  

  @Column("jsonb",{nullable:true})
  metadata!: any; 

  @Column()
  timestamp!: string;

}