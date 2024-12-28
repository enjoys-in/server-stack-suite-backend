import "dotenv/config"
import "reflect-metadata"
import tsConfig from '../path.json'
import { register } from 'tsconfig-paths'
register({ baseUrl: __dirname, paths: tsConfig.paths })
import { bootstrap } from "./application";
export function main() {
    const app = bootstrap.AppServer.InitailizeApplication()!
    
}

main()