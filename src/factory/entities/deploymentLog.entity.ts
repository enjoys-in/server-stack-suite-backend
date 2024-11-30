import { Entity,  Column, ManyToOne } from "typeorm";
import { CommonEntity } from "./common";
import { ApplicationEntity } from "./application.entity";

@Entity()
export class DeploymentLogEntity extends CommonEntity {
  @ManyToOne(() => ApplicationEntity, (application) => application.logs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  application!: ApplicationEntity|null;
 
  @Column({default:"info"})
  level!: string;  

  @Column("text")
  log!: string;  

  @Column("jsonb",{nullable:true})
  metadata!: any; 

  @Column()
  timestamp!: string;

}