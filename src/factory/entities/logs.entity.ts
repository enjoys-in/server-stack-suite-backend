import { Entity, Column} from "typeorm"
import { CommonEntity } from "./common"

@Entity("system_logs")
export class SystemLogsEntity extends CommonEntity {   

    @Column()
    title!: string

    @Column()
    level!: string

    @Column("text",  )
    log!: string    
}