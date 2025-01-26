import helpers from "@/utils/helpers";
import { ServiceMappings } from "@/utils/helpers/constants";
import { SERVER_DATA } from "@/utils/libs/data";
import { MigrationInterface, QueryRunner } from "typeorm";
 
export class Services1737874374068 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
       const services = helpers.transformKeys(Object.values(SERVER_DATA.DEFAULT_SERVICES),ServiceMappings)
        await queryRunner.manager.createQueryBuilder()
            .insert()
            .into('services')
            .values(services)
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
