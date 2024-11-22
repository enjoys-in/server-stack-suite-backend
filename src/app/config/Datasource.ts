import { DataSource } from 'typeorm'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Logging } from '@/logs'

let dbConfig;
// Read the config file
const path = join("/", "opt", "server-stack-suite", "config.json")
try {
      dbConfig = JSON.parse(readFileSync(path, "utf8"))
} catch (error) {
    Logging.dev(`Error reading config file: ${path} \n File does not exist`,"error")
    process.exit(1)
}
const DB = dbConfig.db
export const AppDataSource = new DataSource({
    ...DB,
    type: "postgres",
    synchronize: true,
    logging: false,
    entities: ["build/factory/entities/**/*.js"],
    subscribers: [],
    migrationsRun: false,
    migrations: ["build/factory/migrations/**/*.js"],
    migrationsTableName: "migration_table",
    ssl: false,
    extra: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})
