import {  Column, Entity, JoinColumn, OneToOne, Relation } from "typeorm";
import { CommonEntity } from "./common";

import { ActiveServicesEntity } from "./active_services.enitity";

@Entity("service_data")
export class ServiceDataEntity extends CommonEntity {
    @Column("jsonb", { nullable: true, default: [] })
    users!: Array<{
        username: string;
        password: string;
    }>;

    @Column("jsonb", { default: [], nullable: true })
    databases!: Array<{
        name: string;
        owner: string
    }>;


    @JoinColumn()
    @OneToOne(() => ActiveServicesEntity, u => u.data, { nullable: true, eager: true, onDelete: "CASCADE" })
    active_services!: Relation<ActiveServicesEntity>;
     

}