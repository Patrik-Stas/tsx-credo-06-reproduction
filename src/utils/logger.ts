import { LogLevel, type Logger } from '@credo-ts/core';

/**
 * Simple console logger implementation for Credo
 */
export class SimpleLogger implements Logger {
  public logLevel: LogLevel;

  public constructor(logLevel: LogLevel = LogLevel.info) {
    this.logLevel = logLevel;
  }

  public test(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.test)) {
      console.log(`[TEST] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  public trace(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.trace)) {
      console.trace(`[TRACE] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  public debug(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.debug)) {
      console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  public info(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.info)) {
      console.info(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  public warn(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.warn)) {
      console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  public error(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.error)) {
      console.error(`[ERROR] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  public fatal(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.fatal)) {
      console.error(`[FATAL] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }
}
