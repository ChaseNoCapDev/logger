import { injectable } from 'inversify';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import type { ILogger, ILogContext } from '../interfaces/ILogger.js';

export interface ILoggerConfig {
  service?: string;
  level?: string;
  logDir?: string;
  maxFiles?: string;
  maxSize?: string;
  test?: boolean;
}

@injectable()
export class WinstonLogger implements ILogger {
  private readonly logger: winston.Logger;
  private readonly context: ILogContext;
  private readonly config: ILoggerConfig;

  constructor(context: ILogContext = {}, config: ILoggerConfig = {}) {
    this.context = context;
    this.config = {
      service: 'h1b-logger',
      level: process.env['LOG_LEVEL'] || 'info',
      logDir: path.join(process.cwd(), 'logs'),
      maxFiles: '14d',
      maxSize: '10m',
      test: false,
      ...config,
    };
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),
    ];

    // Only add file transport in non-test mode
    if (!this.config.test) {
      transports.push(
        new DailyRotateFile({
          dirname: this.config.logDir,
          filename: `${this.config.service}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
        })
      );
    }

    return winston.createLogger({
      level: this.config.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { ...this.context, service: this.config.service },
      transports,
    });
  }

  debug(message: string, context?: ILogContext): void {
    this.logger.debug(message, { ...this.context, ...context });
  }

  info(message: string, context?: ILogContext): void {
    this.logger.info(message, { ...this.context, ...context });
  }

  warn(message: string, context?: ILogContext): void {
    this.logger.warn(message, { ...this.context, ...context });
  }

  error(message: string, error?: Error, context?: ILogContext): void {
    this.logger.error(message, {
      ...this.context,
      ...context,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    });
  }

  child(context: ILogContext): ILogger {
    return new WinstonLogger({ ...this.context, ...context }, this.config);
  }
}
