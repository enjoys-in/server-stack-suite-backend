import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class CommonEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

}