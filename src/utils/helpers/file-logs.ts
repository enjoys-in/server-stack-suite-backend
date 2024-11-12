import { appendFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFile, writeFileSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), "logs")

export const SAVE_LOGS = new Map<string, string>()
// Enum for log levels
export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
  LOG = 'LOG',
  DEBUG = 'DEBUG'
}
type LogLevelKey = keyof typeof LogLevel
// Helper function to format date
export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format timestamp
const formatTimestamp = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};
export async function HandleLogs() {
  const now = new Date();
  const date = formatDate(now);
  const logPath = join(LOG_DIR, `${date}.log`);
  if (!existsSync(logPath)) {
    writeFileSync(logPath, "");
  }
  const UpdateLogsToFileOnStartup = () => {
    const data = readFileSync(logPath, "utf8")
    SAVE_LOGS.set("log", data)
 
    return
  }
  const UpdateLogsToFileOnShutDown = () => {
    const data = SAVE_LOGS.get("logs")
    if (data) {
      InitLogs(data, LogLevel.INFO, true)
    }
  }
 
  return {
    UpdateLogsToFileOnStartup, UpdateLogsToFileOnShutDown, path: logPath
  }
}
// Function to log message
export const InitLogs = (message: string, level: LogLevelKey = "INFO", saveToFile: boolean = true): void => {
  const now = new Date();
  const date = formatDate(now);
  const timestamp = formatTimestamp(now);

  // Ensure the logs directory exists
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }

  // Define log file path
  const logFile = join(LOG_DIR, `${date}.log`);

  // Format log message with timestamp and log level
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;

  appendFileSync(logFile, logEntry, 'utf8');
  
};

