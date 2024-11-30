import { Entity, Column, ManyToOne, Relation } from "typeorm";
import { ApplicationEntity } from "./application.entity";
import { CommonEntity } from "./common";

@Entity()
export class FileEntity extends CommonEntity {

  @Column()
  file_name!: string;

  @Column()
  path!: string;

  @Column('jsonb')
  info!: Record<any, any>;;

  @ManyToOne(() => ApplicationEntity, (application) => application.files, {
    onDelete: 'SET NULL', // Prevents logs deletion from affecting the application
    nullable: true,
  })
  application!: Relation<ApplicationEntity>;
}