import { BeforeInsert, Column, Entity, JoinColumn,  OneToOne,} from "typeorm";
import { CommonEntity } from "./common";
import helpers from "@/utils/helpers";
import { ActiveServicesEntity } from "./active_services.enitity";

@Entity("services")
export class ServicesEntity extends CommonEntity {

    @Column()
    service_id!: string;

    @Column()
    service_name!: string;

    @Column()
    service_slug!: string;

    @Column()
    service_type!: string;

    @Column()
    image_name!: string;

    @Column()
    service_description!: string;

    @Column("text", { array: true, default: () => "'{}'", nullable: true })
    service_port!: string[];

    @Column({ default: false })
    auth_required!: boolean;

    @Column({ default: false })
    service_status!: boolean;

    @JoinColumn()
    @OneToOne(() => ActiveServicesEntity, (svc) => svc.id,{nullable:true})
    is_active_service!: ActiveServicesEntity;
 
    @BeforeInsert()
    createServiceId() {
        this.service_id = helpers.randomToken(32);
    }

}