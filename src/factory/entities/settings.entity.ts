import { Entity, Column } from "typeorm"
import { CommonEntity } from "./common"

@Entity("settings")
export class SettingsEnitity extends CommonEntity {

    @Column()
    hostname!: string

    @Column({ default: "sqlite", enum: ["sqlite", "mysql", "postgres"] })
    database_type!: string

    @Column({ default: false })
    enbale_notifications!: boolean

    @Column({ default: false })
    enbale_webhook!: boolean

    @Column({ nullable: true })
    last_factory_reset!: string
}