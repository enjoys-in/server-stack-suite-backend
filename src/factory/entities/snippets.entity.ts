import { Entity, Column } from "typeorm"
import { CommonEntity } from "./common"


@Entity("snippets")
export class SnippetsEnitity extends CommonEntity {

    @Column()
    label!:string

    @Column()
    script!:string 


}