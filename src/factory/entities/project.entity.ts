import { Entity, Column, JoinColumn, ManyToOne, Relation, OneToMany } from "typeorm"
import { CommonEntity } from "./common"
import { UserEntity } from "./users.entity"
import { ApplicationEntity } from "./application.entity"

@Entity("projects")
export class ProjectsEnitity extends CommonEntity {

    @Column()
    name!: string

    @Column()
    description!: string

    @Column({default:""})
    project_path!: string

    @ManyToOne(() => UserEntity, (user) => user.project,)
    @JoinColumn({ name: "created_by" })
    created_by!: Relation<UserEntity>

    @OneToMany(() => ApplicationEntity, (app) => app.project, { cascade: true, nullable: true })
    applications!: ApplicationEntity[]

}