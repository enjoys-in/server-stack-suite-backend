import { Entity, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { UsersHistoryEntity } from './users_history.entity';
import { CommonEntity } from './common';
import { HostsEnitity } from './hosts.entity';
import { USER_STATUS } from '@/utils/helpers/constants';
import { DASHBOAD_CONFIG } from '@/utils/interfaces/user.interface';
import { ProjectsEnitity } from './project.entity';
import { IntegrationsEntity } from './integrations.enitity';
import { ActiveServicesEntity } from './active_services.enitity';



@Entity({ name: 'users' })
export class UserEntity extends CommonEntity {

    @Column()
    name!: string;

    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ enum: USER_STATUS, default: USER_STATUS.INACTIVE })
    status!: string;

    @Column({ default: false })
    isfirstlogin!: boolean;

    @Column({ default: DASHBOAD_CONFIG.PROCESSING, enum: DASHBOAD_CONFIG })
    dashboard_config!: string;

    @Column('json', { nullable: true })
    lastlogin!: object[];

    @OneToOne(() => UsersHistoryEntity, { nullable: true, cascade: ["insert"], onDelete: "CASCADE", onUpdate: "NO ACTION" })
    @JoinColumn()
    history!: UsersHistoryEntity

    @OneToMany(() => HostsEnitity, (hosts) => hosts.user, { nullable: true, cascade: ["insert"], onDelete: "CASCADE", onUpdate: "NO ACTION" })
    hosts!: HostsEnitity[]

    @OneToMany(() => ProjectsEnitity, (projects) => projects.created_by, { nullable: true, cascade: ["insert"], onDelete: "CASCADE", onUpdate: "NO ACTION" })
    project!: ProjectsEnitity[]

    @OneToMany(() => IntegrationsEntity, (integrations) => integrations.user, { nullable: true, cascade: ["insert"], onDelete: "CASCADE", onUpdate: "NO ACTION" })
    integrations!: IntegrationsEntity[];

    @OneToMany(() => ActiveServicesEntity, (svc) => svc.user, { nullable: true, cascade: ["insert"], onDelete: "CASCADE", onUpdate: "NO ACTION" })
    active_services!: ActiveServicesEntity[];


}