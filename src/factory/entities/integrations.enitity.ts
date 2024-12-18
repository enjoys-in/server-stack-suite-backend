import { Entity, Column, JoinColumn, Relation, OneToOne } from "typeorm";
import { ApplicationEntity } from "./application.entity";
import { CommonEntity } from "./common";
import { IntegrationsType } from "@/utils/interfaces/deployment.interface";

@Entity("integrations")
export class IntegrationsEntity extends CommonEntity {

  @Column()
  name!: string;

  @Column({nullable:true})
  description!: string;

  @Column()
  provider!: string;

  @Column({enum:IntegrationsType})
  type!: string;

  @Column('jsonb')
  metadata!: Record<any, any>;

  @Column({default:false})
  is_active!: boolean;

}