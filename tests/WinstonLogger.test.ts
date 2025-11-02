import { describe, it, expect, beforeEach } from 'vitest';
import { WinstonLogger } from '../src/implementations/WinstonLogger';
import { createLogger, createTestLogger } from '../src/factories/createLogger';

describe('WinstonLogger', () => {
  let logger: WinstonLogger;

  beforeEach(() => {
    // Create test logger that doesn't write to files
    logger = new WinstonLogger({ test: true }, { test: true });
  });

  describe('Basic logging methods', () => {
    it('should have all required logging methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.child).toBe('function');
    });

    it('should log debug messages without throwing', () => {
      expect(() => {
        logger.debug('Debug message', { extra: 'data' });
      }).not.toThrow();
    });

    it('should log info messages without throwing', () => {
      expect(() => {
        logger.info('Info message', { extra: 'data' });
      }).not.toThrow();
    });

    it('should log warnings without throwing', () => {
      expect(() => {
        logger.warn('Warning message', { extra: 'data' });
      }).not.toThrow();
    });

    it('should log errors with Error objects without throwing', () => {
      const error = new Error('Test error');
      expect(() => {
        logger.error('Error occurred', error, { extra: 'data' });
      }).not.toThrow();
    });

    it('should log errors without Error objects without throwing', () => {
      expect(() => {
        logger.error('Error message without exception');
      }).not.toThrow();
    });
  });

  describe('Child logger functionality', () => {
    it('should create child logger with additional context', () => {
      const childLogger = logger.child({ requestId: '123', userId: 'test-user' });

      expect(childLogger).toBeDefined();
      expect(childLogger).not.toBe(logger);
      expect(childLogger).toBeInstanceOf(WinstonLogger);

      // Child logger should work
      expect(() => {
        childLogger.info('Child logger message');
      }).not.toThrow();
    });

    it('should inherit parent context in child logger', () => {
      const parentLogger = new WinstonLogger({ service: 'parent' }, { test: true });
      const childLogger = parentLogger.child({ operation: 'test' });

      // Should not throw and have both contexts
      expect(() => {
        childLogger.info('Message with combined context');
      }).not.toThrow();
    });
  });

  describe('Configuration options', () => {
    it('should accept custom configuration', () => {
      const customLogger = new WinstonLogger(
        { service: 'custom' },
        {
          service: 'custom-service',
          level: 'debug',
          test: true,
        }
      );

      expect(() => {
        customLogger.debug('Custom configured message');
      }).not.toThrow();
    });

    it('should use environment LOG_LEVEL when provided', () => {
      const originalLogLevel = process.env['LOG_LEVEL'];
      process.env['LOG_LEVEL'] = 'error';

      const envLogger = new WinstonLogger({}, { test: true });

      expect(() => {
        envLogger.error('This should log at error level');
      }).not.toThrow();

      // Restore original value
      if (originalLogLevel !== undefined) {
        process.env['LOG_LEVEL'] = originalLogLevel;
      } else {
        delete process.env['LOG_LEVEL'];
      }
    });
  });

  describe('Factory functions', () => {
    it('should create logger with createLogger factory', () => {
      const factoryLogger = createLogger('test-service', { module: 'factory' });

      expect(factoryLogger).toBeInstanceOf(WinstonLogger);
      expect(() => {
        factoryLogger.info('Factory created logger');
      }).not.toThrow();
    });

    it('should create test logger with createTestLogger factory', () => {
      const testLogger = createTestLogger('test-service', { test: 'true' });

      expect(testLogger).toBeInstanceOf(WinstonLogger);
      expect(() => {
        testLogger.info('Test logger message');
      }).not.toThrow();
    });

    it('should create logger with default service name in createTestLogger', () => {
      const defaultTestLogger = createTestLogger();

      expect(defaultTestLogger).toBeInstanceOf(WinstonLogger);
      expect(() => {
        defaultTestLogger.info('Default test logger');
      }).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should handle errors with full error objects', () => {
      const error = new Error('Test error with stack');
      error.stack = 'Error: Test error\n    at test (test.js:1:1)';

      expect(() => {
        logger.error('Error with stack trace', error, { contextData: 'value' });
      }).not.toThrow();
    });

    it('should handle errors without stack traces', () => {
      const error = new Error('Simple error');
      delete error.stack;

      expect(() => {
        logger.error('Error without stack', error);
      }).not.toThrow();
    });
  });
});
