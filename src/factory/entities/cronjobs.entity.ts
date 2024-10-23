import { Column,Entity } from "typeorm";
import { CommonEntity } from "./common";

@Entity({ name: 'cron_jobs' })
export class CronJobEntity extends CommonEntity {   

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    cron_expression!: string;

  
}