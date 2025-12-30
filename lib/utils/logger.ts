type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, metadata, error } = entry;
    const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : "";
    const errorStr = error ? `\n${error.stack}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}${errorStr}`;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      error,
    };

    const formatted = this.formatMessage(entry);

    // In development, log to console
    if (this.isDevelopment) {
      switch (level) {
        case "error":
          console.error(formatted);
          break;
        case "warn":
          console.warn(formatted);
          break;
        case "debug":
          console.debug(formatted);
          break;
        default:
          console.log(formatted);
      }
    }

    // In production, you would send to a logging service
    // Example: sendToLoggingService(entry);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log("warn", message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>) {
    this.log("error", message, metadata, error);
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log("debug", message, metadata);
    }
  }
}

export const logger = new Logger();

