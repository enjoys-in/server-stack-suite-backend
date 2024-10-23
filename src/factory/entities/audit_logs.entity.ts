import { Entity, Column} from "typeorm"
import { CommonEntity } from "./common"

@Entity("audit_logs")
export class AuditLogsEnitity extends CommonEntity {    

    @Column({ nullable: true })
    key!: string

    @Column({ nullable: true })
    title!: string

    @Column("simple-json", { nullable: true })
    log!: any   
   
}