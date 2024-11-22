import { Entity,  Column,  ManyToOne, Relation } from "typeorm";
import { ApplicationEntity } from "./application.entity";
import { CommonEntity } from "./common";

@Entity()
export class FileEntity extends CommonEntity{
  
  @Column()
  file_name!: string;

  @Column() // Store file data as binary
  path!: string;

  @Column('jsonb') // Store file data as binary
  info!: Record<any,any>;;

  @ManyToOne(() => ApplicationEntity, (application) => application.files)
  application!: Relation<ApplicationEntity>;
}