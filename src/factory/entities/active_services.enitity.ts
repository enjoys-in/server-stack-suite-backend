import { Column, Entity, JoinColumn, ManyToOne, OneToOne, Relation } from "typeorm";
import { CommonEntity } from "./common";
import { UserEntity } from "./users.entity";
import { ContainerStatus, ServicesData } from "@/utils/interfaces/deployment.interface";
import { ServiceDataEntity } from "./service-data.entity";

@Entity("active_services")
export class ActiveServicesEntity extends CommonEntity {

    @Column({ nullable: true })
    container_id!: string;

    @Column()
    service_slug!: string;

    @Column("jsonb")
    service_metadata!: ServicesData;

    @Column("jsonb",{select:false})
    credentials!: {
        username: string;
        password: string;
    };

    @Column("jsonb", { nullable: true,select:false })
    container_metadata!: Record<string, any>;
 
    @Column({ nullable: true })
    started_at!: string;

    @Column({ nullable: true })
    stopped_at!: string;

    @JoinColumn()
    @ManyToOne(() => UserEntity, u => u.active_services, { nullable: true })
    user!: Relation<UserEntity>;
   
    @OneToOne(() => ServiceDataEntity, u => u.active_services, { nullable: true })
    data!: ServiceDataEntity

    @Column({ default: ContainerStatus.STOPPED, enum: ContainerStatus })
    status!: string

}