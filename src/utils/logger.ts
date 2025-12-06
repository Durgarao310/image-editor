/**
 * Structured Logger
 * Production-grade logging utility with different log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Pretty print for development
      const contextStr = entry.context
        ? `\n${JSON.stringify(entry.context, null, 2)}`
        : '';
      return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}`;
    } else {
      // JSON format for production
      return JSON.stringify(entry);
    }
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  /**
   * Debug level log
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      const entry = this.createLogEntry('debug', message, context);
      console.debug(this.formatLog(entry));
    }
  }

  /**
   * Info level log
   */
  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('info', message, context);
    console.log(this.formatLog(entry));
  }

  /**
   * Warning level log
   */
  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('warn', message, context);
    console.warn(this.formatLog(entry));
  }

  /**
   * Error level log
   */
  error(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('error', message, context);
    console.error(this.formatLog(entry));
  }
}

export const logger = new Logger();
