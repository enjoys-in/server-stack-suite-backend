import { Entity, Column } from "typeorm"
import { CommonEntity } from "./common"

@Entity("deploys_keys")
export class DeploysKeysEntity extends CommonEntity {

    @Column()
    provider!: string

    @Column()
    key_name!: string

    @Column()
    email!: string

    @Column({nullable:true})
    passphrase!: string

    @Column({nullable:true})
    git_url!: string

    @Column({default:"rsa"})
    key_type!: string

    @Column("text",{select:false})
    public_key!: string

    @Column("text",{select:false})
    private_key!: string

    @Column("simple-json", { nullable: true })
    path!: any

    @Column({ default:false })
    is_active!: boolean

    @Column({ default:false })
    is_added!: boolean

}