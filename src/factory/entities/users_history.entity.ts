import { Entity, Column} from "typeorm"
import { CommonEntity } from "./common"

@Entity("users_history")
export class UsersHistoryEntity extends CommonEntity {


    @Column({ nullable: true })
    data!: string

    @Column({ nullable: true })
    lastLogin!: string

    @Column("simple-json", { nullable: true })
    loginHistory!: {
        dateTime: string
        ip: string | string[]
    }[]   


}