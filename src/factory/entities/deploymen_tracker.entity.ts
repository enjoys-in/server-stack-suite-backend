import { Column,  Entity, } from "typeorm";
import { CommonEntity } from "./common";

@Entity("deployment_tracker")
export class DeploymentTrackerEntity extends CommonEntity{
    
    @Column({unique:true})
    application_id!: number;
    
    @Column({enum:["idle" , "in-progress" , "cancelled"],default:"idle"})
    status!: string;

    @Column()
    started_at!: string;

    @Column({default:""})
    ended_at!: string;
}