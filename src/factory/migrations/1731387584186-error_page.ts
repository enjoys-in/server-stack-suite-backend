import { DEFAULT_STATUS } from "@/utils/interfaces/user.interface";
import { PATHS } from "@/utils/paths";
import { readFileSync } from "fs";
import { MigrationInterface, QueryRunner } from "typeorm";

export class ErrorPage1731387584186 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(`SELECT * FROM error_pages WHERE name=$1 AND name=$2`, ["default", "404"])
    
    if (result.length > 0) {
      return
    }

    const defaultFilecontent = readFileSync(PATHS.NGINX.INDEX_HTML, "utf8")
    const custom404 = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Not Found</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.0/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body class="flex items-center justify-center min-h-screen bg-gray-100">

    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-800">404</h1>
      <p class="text-2xl text-gray-600 mt-4">Page Not Found</p>
      <p class="text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" class="mt-6 inline-block px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
        Go back to Home
      </a>
    </div>

  </body>
  </html>`



  await queryRunner.query(
    `INSERT INTO error_pages (name, status, path, content) VALUES 
    ($1, $2, $3, $4),
    ($5, $6, $7, $8)`,
    [
      'default', DEFAULT_STATUS.ACTIVE, "/", defaultFilecontent,
      "404", DEFAULT_STATUS.INACTIVE, "/", custom404
    ]
  );
  
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
