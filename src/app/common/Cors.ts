import cors, { CorsOptions } from 'cors'
export class Cors {

    static useCors() {
        return cors({ ...this.options })
    }
    /**
     * Returns the options for the function.
     *
     * @return {CorsOptions} The options object containing the origin, optionsSuccessStatus, and credentials properties.
     */
    private static options(): CorsOptions {
        return {
            origin: ["http://localhost:3000"],
            optionsSuccessStatus: 200,
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization,x-app-version,x-app-name,x-api-key,Access-Control-Allow-Origin,Cache-Control",
            credentials: true
        }
    }
}