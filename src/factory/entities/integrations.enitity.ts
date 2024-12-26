import { Entity, Column, JoinColumn,  ManyToOne, Relation } from "typeorm";
import { CommonEntity } from "./common";
import { IntegrationMetadata, IntegrationsProviderCredType, IntegrationsProviderType } from "@/utils/interfaces/deployment.interface";
import { UserEntity } from "./users.entity";

@Entity("integrations")
export class IntegrationsEntity extends CommonEntity {

  @Column()
  name!: string;

  @Column({ enum: IntegrationsProviderType })
  provider!: string;

  @Column({ enum: IntegrationsProviderCredType })
  access_type!: string;

  @Column('jsonb')
  metadata!:Partial<IntegrationMetadata>;

  @Column({ default: false })
  is_active!: boolean;

  @ManyToOne(() => UserEntity, (user) => user.integrations, { cascade: true })
  @JoinColumn()
  user!: Relation<UserEntity>;

}