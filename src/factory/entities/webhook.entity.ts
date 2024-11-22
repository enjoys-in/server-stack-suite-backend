import { Column, Entity } from "typeorm";
import { CommonEntity } from "./common";
import { DEFAULT_STATUS } from "@/utils/interfaces/user.interface";

@Entity("webhooks")
export class WebhookEntity extends CommonEntity {

  
    @Column()
    applicationId!: number;
  
    @Column()
    event!: string;

    @Column()
    url!: string;

    @Column({ default: DEFAULT_STATUS.INACTIVE, enum: DEFAULT_STATUS })
    status!: string


}