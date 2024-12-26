import { Entity, Column, JoinColumn, Relation, OneToOne } from "typeorm";
import { ApplicationEntity } from "./application.entity";
import { CommonEntity } from "./common";

@Entity("health-check")
export class HealthcheckEntity extends CommonEntity {

  @Column()
  path!: string;

  @JoinColumn()
  @OneToOne(() => ApplicationEntity, (app) => app.healthCheck)
  application!: Relation<ApplicationEntity>; 

  @Column()
  is_maintainance_mode!: boolean;

  @Column({ nullable: true })
  maintainance_url!: string;   

  @Column({ default: false })
  is_healthy!: boolean;   

  @Column({ default: false })
  is_active!: boolean;

}