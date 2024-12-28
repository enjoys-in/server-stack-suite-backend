import { Entity, Column, JoinColumn, Relation, OneToOne } from "typeorm";
import { ApplicationEntity } from "./application.entity";
import { CommonEntity } from "./common";

@Entity("health-check")
export class HealthcheckEntity extends CommonEntity {

  @Column({default:"/healthz",})
  healthcheck_path!: string;

  @JoinColumn()
  @OneToOne(() => ApplicationEntity, (app) => app.healthCheck)
  application!: Relation<ApplicationEntity>;   

  @Column({ default: false })
  is_healthy!: boolean;   

  @Column({ default: true })
  is_active!: boolean;

}