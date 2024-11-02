import { Entity, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, Relation, } from "typeorm"
import { CommonEntity } from "./common"
import { SSLCertificatesEnitity } from "./ssl_certificates.entity"
import { UserEntity } from "./users.entity"
import { HOST_STATUS, HOST_TYPE } from "@/utils/interfaces/user.interface"
import { SERVER_TYPE,Domain } from "@/utils/interfaces"
 

@Entity("hosts")
export class HostsEnitity extends CommonEntity {

    @Column("simple-json", {})
    domains!: Domain[]

    @Column({ default: null, nullable: true })
    domain_name!: string

    @Column({ default: "/" })
    path!: string

    @Column()
    destination!: string

    @Column({ default: false })
    auto_ssl!: boolean

    @Column({ default: false })
    publicly_accessible!: boolean

    @Column({ default: HOST_STATUS.OFFLINE, enum: HOST_STATUS })
    status!: string

    @Column({ default: HOST_TYPE.PROXY, enum: HOST_TYPE })
    host_type!: string

    @Column({ default: false })
    websocket_support!: boolean

    @Column({ default: false })
    block_exploits!: boolean

    @Column({ default: false })
    ip_whitelist!: boolean

    @Column({ default: false })
    allowed_ips!: string

    @Column({ default: false })
    allow_caching!: boolean

    @Column({ default: false })
    force_https_redirect!: boolean

    @Column({ default: false })
    has_custom_headers!: boolean

    @Column("simple-json", { default: null, nullable: true })
    custom_headers!: Array<{ name: string, value: string }>

    @Column({ default: SERVER_TYPE.NGINX, enum: SERVER_TYPE})
    server_type!:  string

    @OneToOne(() => SSLCertificatesEnitity, { nullable: true, cascade: ["insert"], onDelete: "CASCADE", onUpdate: "NO ACTION" })
    @JoinColumn()
    ssl!: Relation<SSLCertificatesEnitity>

    @ManyToOne(() => UserEntity, (user) => user.hosts, { nullable: true, })
    @JoinColumn()
    user!: Relation<UserEntity>


}