import { Entity, Column, OneToOne, JoinColumn, Relation } from "typeorm"
import { CommonEntity } from "./common"
import { HostsEnitity } from "./hosts.entity"
import { UserEntity } from "./users.entity"
import { SSL_STATUS } from "@/utils/types/user.interface"

@Entity("ssl_certificates")
export class SSLCertificatesEnitity extends CommonEntity {

    @Column("text")
    domain!: string

    @Column()
    provider!: string

    @Column()
    expires!: string

    @Column("simple-json")
    ssl_certificates!: {
        pk_key: string
        cert_key: string
    }

    @Column({ default: SSL_STATUS.INACTIVE, enum: SSL_STATUS })
    status!: string

    @OneToOne(() => HostsEnitity)
    @JoinColumn()
    host!: Relation<HostsEnitity>

}