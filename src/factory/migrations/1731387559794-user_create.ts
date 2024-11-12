import utils from "@/utils";
import { USER_STATUS } from "@/utils/interfaces/user.interface";
import { MigrationInterface, QueryRunner } from "typeorm";

export class UserCreate1731387559794 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO users (name,username, email, password,status,isfirstlogin) VALUES($1, $2, $3, $4, $5,$6)`, ['admin','admin', 'admin@admin.com', await utils.HashPassword("Admin@123"),USER_STATUS.ACTIVE,true]);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
