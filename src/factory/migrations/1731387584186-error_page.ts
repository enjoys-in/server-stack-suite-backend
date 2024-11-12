import { DEFAULT_STATUS } from "@/utils/interfaces/user.interface";
import { MigrationInterface, QueryRunner } from "typeorm";

export class ErrorPage1731387584186 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const content = ` <!DOCTYPE html>
        <html>
          <head>
            <title>Welcome to nginx!</title>
            <style>
              body {
                width: 35em;
                margin: 0 auto;
                font-family: Tahoma, Verdana, Arial, sans-serif;
              }
            </style>
          </head>
          <body>
            <h1>Welcome to nginx!</h1>
            <p>
              If you see this page, the nginx web server is successfully installed and
              working. Further configuration is required.
            </p>

            <p>
              For online documentation and support please refer to
              <a href="http://nginx.org/">nginx.org</a>.<br />
              Commercial support is available at
              <a href="http://nginx.com/">nginx.com</a>.
            </p>

            <p><em>Thank you for using nginx.</em></p>
          </body>
        </html> `
        await queryRunner.query(`INSERT INTO error_pages (name, status, path,content) VALUES($1, $2, $3, $4)`, ['default', DEFAULT_STATUS.ACTIVE, "/", content]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
