import { Column, Entity, ManyToOne, Relation } from "typeorm";
import { CommonEntity } from "./common";
import { HostsEnitity } from "./hosts.entity";
import { UserEntity } from "./users.entity"
import { DEFAULT_STATUS } from "@/utils/interfaces/user.interface";

@Entity({ name: 'server_types' })
export class ServerTypesEntity extends CommonEntity {

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    slug!: string;

    @Column({ default: DEFAULT_STATUS.INACTIVE, enum: DEFAULT_STATUS })
    status!: string

    @ManyToOne(() => HostsEnitity, (hosts) => hosts.server_type, { nullable: true, cascade: ["insert"], onDelete: "CASCADE", onUpdate: "NO ACTION" })
    hosts!: Relation<HostsEnitity>
}