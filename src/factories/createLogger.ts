import { WinstonLogger, type ILoggerConfig } from '../implementations/WinstonLogger.js';
import type { ILogger, ILogContext } from '../interfaces/ILogger.js';

/**
 * Create a logger with the specified service name and optional context
 */
export function createLogger(
  service: string,
  context?: ILogContext,
  config?: Omit<ILoggerConfig, 'service'>
): ILogger {
  return new WinstonLogger(context || {}, { ...config, service });
}

/**
 * Create a test logger that doesn't write to files
 */
export function createTestLogger(service: string = 'test', context?: ILogContext): ILogger {
  return new WinstonLogger(context || {}, { service, test: true });
}
