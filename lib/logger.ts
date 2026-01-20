/**
 * Structured logging utility
 * Replaces console.log/error with structured logging
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

class Logger {
  private logLevel: LogLevel;
  private requestId?: string;
  private userId?: string;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || "info";
  }

  setContext(requestId?: string, userId?: string) {
    this.requestId = requestId;
    this.userId = userId;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatLog(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const context = [
      entry.requestId && `reqId:${entry.requestId}`,
      entry.userId && `userId:${entry.userId}`,
    ]
      .filter(Boolean)
      .join(" ");

    return `${prefix} ${context ? `[${context}]` : ""} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, error?: Error, metadata?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      userId: this.userId,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
      ...(metadata && { metadata }),
    };

    const formatted = this.formatLog(entry);

    // In production, send to logging service (Sentry, Datadog, etc.)
    // For now, use console with appropriate levels
    switch (level) {
      case "debug":
        console.debug(formatted, metadata || "");
        break;
      case "info":
        console.info(formatted, metadata || "");
        break;
      case "warn":
        console.warn(formatted, metadata || "");
        break;
      case "error":
        console.error(formatted, error || metadata || "");
        // TODO: Send to error tracking service (Sentry)
        break;
    }
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.log("debug", message, undefined, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log("info", message, undefined, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log("warn", message, undefined, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>) {
    this.log("error", message, error, metadata);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export helper for request-scoped logging
export function createRequestLogger(requestId: string, userId?: string) {
  const requestLogger = new Logger();
  requestLogger.setContext(requestId, userId);
  return requestLogger;
}
