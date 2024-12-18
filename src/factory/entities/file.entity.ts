import { Entity, Column, JoinColumn, Relation, OneToOne } from "typeorm";
import { ApplicationEntity } from "./application.entity";
import { CommonEntity } from "./common";

@Entity()
export class FileEntity extends CommonEntity {

  @Column()
  file_name!: string;

  @Column()
  path!: string;

  @Column('jsonb')
  info!: Record<any, any>;

  @OneToOne(() => ApplicationEntity, (application) => application.file, {
    onDelete: 'SET NULL', // Prevents logs deletion from affecting the application
    nullable: true,
  })
  JoinColumn()
  application!: Relation<ApplicationEntity>;
}