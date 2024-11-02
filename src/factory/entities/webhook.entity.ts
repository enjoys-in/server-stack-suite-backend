import { Column, Entity } from "typeorm";
import { CommonEntity } from "./common";
import { UserEntity } from "./users.entity"
import { DEFAULT_STATUS } from "@/utils/interfaces/user.interface";

@Entity("webhooks")
export class WebhookEntity extends CommonEntity {

    @Column()
    provider!: string

    @Column()
    webhook_url!: string

    @Column('jsonb')
    configuation: any

    @Column({ default: DEFAULT_STATUS.INACTIVE, enum: DEFAULT_STATUS })
    status!: string


}