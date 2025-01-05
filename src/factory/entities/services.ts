import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, Relation } from "typeorm";
import { CommonEntity } from "./common";
import { UserEntity } from "./users.entity";
import { ContainerStatus, ServicesData } from "@/utils/interfaces/deployment.interface";
import helpers from "@/utils/helpers";
import { ActiveServicesEntity } from "./active_services.enitity";

@Entity("services")
export class ServicesEntity extends CommonEntity {

    @Column()
    serviceId!: string;

    @Column()
    serviceName!: string;

    @Column()
    service_slug!: string;

    @Column()
    serviceType!: string;

    @Column()
    imageName!: string;

    @Column()
    serviceDescription!: string;

    @Column("jsonb")
    servicePort!: string[];

    @Column({ default: false })
    auth_required!: boolean;

    // @JoinColumn()
    // @ManyToOne(() => ActiveServicesEntity, u => u.services, { nullable: true })
    // active_services!: Relation<ActiveServicesEntity>;
    @BeforeInsert()
    createServiceId() {
        this.serviceId = helpers.randomToken(32);
    }

}