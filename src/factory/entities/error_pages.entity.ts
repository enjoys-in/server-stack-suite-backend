import { Entity, Column } from "typeorm"
import { CommonEntity } from "./common"
import { DEFAULT_STATUS } from "@/utils/interfaces/user.interface"
import { SERVER_TYPE } from "@/utils/interfaces"


@Entity("error_pages")
export class ErrorPagesEnitity extends CommonEntity {
    @Column()
    name!: string

    @Column()
    path!: string

    @Column("text")
    content!: string

    @Column({ enum: DEFAULT_STATUS, default: DEFAULT_STATUS.DRAFT })
    status!: string

    @Column({ default: SERVER_TYPE.NGINX, enum: SERVER_TYPE})
    server_type!:  string

}