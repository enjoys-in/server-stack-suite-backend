import * as crypto from "crypto";
import moment from "moment";
import { join } from "path";
import { createCipheriv, createHash, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const validSubdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

 
export let Tokens = new Map();
export let BlacklistedTokens: string[] = [];
export const SetAppRoutes = new Map();
class Helpers {
    isValidSubdomain = (subdomain: string): boolean => validSubdomainRegex.test(subdomain);
    randomPort(runnigPorts: Record<any, any>, minPort: number, maxPort: number) {
        const port = Math.floor(Math.random() * (minPort - maxPort + 1)) + minPort;

        if (runnigPorts[port]) {
            this.randomPort(runnigPorts, port, minPort);
        }

        runnigPorts[port] = true;

        return port;
    };
    formatBytes(sizeInKB: number) {
        if (!sizeInKB) {
            return ''
        }
        const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        let index = 0

        while (sizeInKB >= 1024 && index < units.length - 1) {
            sizeInKB /= 1024
            index++
        }

        return `${sizeInKB.toFixed(2)} ${units[index]}`
    }
    isValidIP(input:string) {
        // Check IPv4 format
        const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        if (ipv4Pattern.test(input)) {
            return true
        }

        // Check IPv6 format
        const ipv6Pattern = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i
        if (ipv6Pattern.test(input)) {
            return true
        }

        // If input doesn't match IPv4 or IPv6 patterns, it's not a valid IP
        return false
    }
    sentenceCase(str: string) {
        // Convert camelCase to sentence case
        str = str.replace(/([a-z])([A-Z])/g, '$1 $2');

        // Replace special characters with a single space
        str = str.replace(/[^a-zA-Z0-9]+/g, ' ');

        // Trim leading/trailing spaces and ensure single spaces between words
        return str.trim().replace(/\s+/g, ' ');
    }
    async generateRandomToken(id: string): Promise<string> {
        const iv = randomBytes(16);
        const SECRET = '!@@#$%^&*()_+';
        const key = (await promisify(scrypt)(SECRET, 'salt', 32)) as Buffer;
        const cipher = createCipheriv('aes-256-ctr', key, iv);
        const encrypted = Buffer.concat([
            cipher.update(id),
            cipher.final(),
        ]);
        return encrypted.toString()
    }
    createOTP(min: number = 100000, max: number = 999999): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /**
     * Converts a query string to an object.
     *
     * @param {string} query - The query string to convert.
     * @return {object} The resulting object.
     */
    queryToObject(query: string): object {
        let NewObject = {};
        query.split("&").map((item) => {
            const [key, value] = item.split("=");
            Object.assign(NewObject, Object.fromEntries([[key, value]]));
            return Object.fromEntries([[key, value]]);
        });

        return NewObject;
    }
    /**
     * Converts a string representation of a date word into a formatted date string.
     *
     * @param {string} str - The string representation of the date word.
     * @return {string} - The formatted date string.
     */
    convertDateWordsToDate(str: string): string {
        let newDate;
        if (str === "Latest") {
            newDate = moment().subtract(10, "minutes").toDate();
        } else if (str === "LastHour") {
            newDate = moment().subtract(1, "hour").toDate();
        } else if (str === "Last24hour") {
            newDate = moment().subtract(24, "hour").toDate();
        } else {
            const number = str.replace(/[^0-9]/g, "");
            newDate = moment().subtract(number, `days`).toDate();
        }

        const date = this.simpleDateStr(newDate);
        return date;
    }
    /**
     * Generates a string representation of a date.
     *
     * @param {Date} newDate - The date to convert to a string. Defaults to the current date.
     * @return {string} The string representation of the date.
     */
    simpleDateStr(newDate: Date = new Date()): string {
        const newDateStr = newDate.toISOString().split("T");
        const date = (newDateStr[0] + " " + newDateStr[1].split(".")[0])
            .trim()
            .toString();

        return date;
    }

    /**
     * Generates the keys and values of an object.
     *
     * @param {string} obj - the object to generate keys and values for
     * @return {string[]} an array containing the keys and values of the object
     */
    objectKeysAndValues(obj: string): string[] {
        let keys = Object.keys(JSON.parse(obj));
        const PureObject = keys.map((key) => {
            return JSON.parse(JSON.parse(obj)[key]);
        });
        return PureObject;
    }
    /**
     * Formats the salary to a string with comma-separated thousands and no decimal places.
     *
     * @param {number} salary - The salary to be formatted.
     * @return {string} - The formatted salary as a string.
     */
    indianNumberFormat(salary: number): string {
        return salary.toLocaleString("en-IN", { maximumFractionDigits: 0 });
    }

    /**
     * Slugify a given string.
     *
     * @param {string} str - The string to be slugified.
     * @return {string} The slugified string.
     */
    slugify(str: string): string {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
   
   
    createPath = (currentPath: string) => {
        const currentPathArray = currentPath.split("/")
        return join(process.cwd(), ...currentPathArray)
    }
    randomToken(length: number = 64): string {
        return crypto.randomBytes(length).toString("hex");
    }
    /**
     * Generates a random number within a specified range.
     *
     * @param {number} min - The minimum value of the range (default: 100000).
     * @param {number} max - The maximum value of the range (default: 999999).
     * @return {number} - The randomly generated number.
     */
    randomNumber(min: number = 100000, max: number = 999999): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /**
     * Generates a unique user ID.
     *
     * @return {string} The generated user ID.
     */
    createUserID(): string {
        const id = Math.floor(Math.random() * 10000000).toString();
        return id;
    }
    /**
     * Generates a token of random bytes with the specified byte length.
     *
     * @param {number} byteLength - The length of the token in bytes. Defaults to 48.
     * @return {string} - The generated token as a base64-encoded string.
     */
    generateToken(byteLength: number = 48): string {
        return crypto.randomBytes(byteLength).toString("base64");
    }
    /**
     * Generates a refresh token of a specified length.
     *
     * @param {number} byteLength - The length of the refresh token in bytes. Defaults to 32.
     * @return {string} - The generated refresh token.
     */
    createRefreshToken(byteLength: number = 32): string {
        return crypto.randomBytes(byteLength).toString("base64");
    }
    /**
     * Generates a random request ID with the specified byte length.
     *
     * @param {number} byteLength - The length of the byte array used to generate the request ID. Defaults to 16.
     * @return {string} - The generated request ID as a base64 encoded string.
     */
    RequestId(byteLength: number = 16): string {
        return crypto.randomBytes(byteLength).toString("base64");
    }
    /**
     * Generates a new refresh token for the given ID and stores it in the Tokens map.
     *
     * @param {string} id - The ID of the user for whom the refresh token is generated.
     * @return {string} - The newly generated refresh token.
     */
    HandleRefreshToken(id: string): string {
        const RefreshToken = this.createRefreshToken();
        Tokens.set(id, RefreshToken);
        return RefreshToken;
    }
    /**
     * Converts a string to a number.
     *
     *
     * @return {number} The converted number.
     */
    CreateOTP(min: number = 100000, max: number = 999999): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /**
     * Converts a query string to an object.
     *
     * @param {string} query - The query string to convert.
     * @return {object} The resulting object.
     */
    QueryToObject(query: string): object {
        let NewObject = {};
        query.split("&").map((item) => {
            const [key, value] = item.split("=");
            Object.assign(NewObject, Object.fromEntries([[key, value]]));
            return Object.fromEntries([[key, value]]);
        });

        return NewObject;
    }
    /**
     * Converts a string representation of a date word into a formatted date string.
     *
     * @param {string} str - The string representation of the date word.
     * @return {string} - The formatted date string.
     */
    ConvertDateWordsToDate(str: string): string {
        let newDate;
        if (str === "Latest") {
            newDate = moment().subtract(10, "minutes").toDate();
        } else if (str === "LastHour") {
            newDate = moment().subtract(1, "hour").toDate();
        } else if (str === "Last24hour") {
            newDate = moment().subtract(24, "hour").toDate();
        } else {
            const number = str.replace(/[^0-9]/g, "");
            newDate = moment().subtract(number, `days`).toDate();
        }

        const date = this.SimpleDateStr(newDate);
        return date;
    }
    /**
     * Generates a string representation of a date.
     *
     * @param {Date} newDate - The date to convert to a string. Defaults to the current date.
     * @return {string} The string representation of the date.
     */
    SimpleDateStr(newDate: Date = new Date()): string {
        const newDateStr = newDate.toISOString().split("T");
        const date = (newDateStr[0] + " " + newDateStr[1].split(".")[0])
            .trim()
            .toString();

        return date;
    }
    /**
     * Cleans and purifies a string by converting it to lowercase, removing leading and trailing whitespace,
     * removing all spaces, replacing multiple spaces or underscores with a single hyphen,
     * and removing leading and trailing hyphens.
     *
     * @param {string} str - The string to be purified.
     * @return {string} The purified string.
     */
    purifyString(str: string): string {
        return str
            .toLowerCase()
            .trim()
            .replace(/\s/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
    /**
     * Generates the keys and values of an object.
     *
     * @param {string} obj - the object to generate keys and values for
     * @return {string[]} an array containing the keys and values of the object
     */
    ObjectKeysAndValues(obj: string): string[] {
        let keys = Object.keys(JSON.parse(obj));
        const PureObject = keys.map((key) => {
            return JSON.parse(JSON.parse(obj)[key]);
        });
        return PureObject;
    }
    /**
     * Formats the salary to a string with comma-separated thousands and no decimal places.
     *
     * @param {number} salary - The salary to be formatted.
     * @return {string} - The formatted salary as a string.
     */
    IndianNumberFormat(salary: number): string {
        return salary.toLocaleString("en-IN", { maximumFractionDigits: 0 });
    }

    /**
     * Slugify a given string.
     *
     * @param {string} str - The string to be slugified.
     * @return {string} The slugified string.
     */
    Slugify(str: string): string {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
    uuid_v4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }
    Md5Checksum(content: string): string {
        return crypto.createHash("md5").update(content).digest("hex");
    }

    SimpleHash(): string {
        return crypto.randomBytes(32).toString("hex");
    }
}
export default new Helpers();