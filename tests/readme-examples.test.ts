import { describe, it, expect } from 'vitest';
import { createLogger, createTestLogger, WinstonLogger } from '../src/index.js';

describe('README Examples Validation', () => {
  describe('Quick Start Example', () => {
    it('should create logger and handle basic logging', () => {
      const logger = createLogger('my-service');

      // Should not throw errors
      expect(() => {
        logger.info('Application started');
        logger.error('Something went wrong', new Error('Details'));
      }).not.toThrow();
    });
  });

  describe('Factory Functions', () => {
    it('should create logger with context', () => {
      const logger = createLogger('api-service', { version: '1.0.0' });

      expect(() => {
        logger.info('Test message');
      }).not.toThrow();
    });

    it('should create test logger', () => {
      const testLogger = createTestLogger('test-service');

      expect(() => {
        testLogger.info('Test message');
      }).not.toThrow();
    });
  });

  describe('Usage Examples', () => {
    it('should handle basic logging with context', () => {
      const logger = createLogger('user-service');

      expect(() => {
        logger.info('User logged in', { userId: '123' });
        logger.warn('Rate limit approaching', { limit: 100, current: 95 });
        logger.error('Database connection failed', new Error('DB Error'), { attempt: 3 });
      }).not.toThrow();
    });

    it('should support child loggers', () => {
      const logger = createLogger('parent-service');
      const requestLogger = logger.child({
        requestId: 'req-123',
        userId: 'user-456',
      });

      expect(() => {
        requestLogger.info('Processing request');
        requestLogger.error('Validation failed');
      }).not.toThrow();
    });

    it('should support custom configuration', () => {
      expect(() => {
        const customLogger = new WinstonLogger(
          { service: 'api' },
          {
            service: 'custom-api',
            level: 'debug',
            test: true, // Prevent file I/O in tests
            maxFiles: '30d',
          }
        );
        customLogger.info('Custom logger test');
      }).not.toThrow();
    });

    it('should support test logger in testing scenarios', () => {
      const logger = createTestLogger('test-service');

      expect(() => {
        logger.debug('Debug message');
        logger.info('Info message');
        logger.warn('Warning message');
        logger.error('Error message', new Error('Test error'));
      }).not.toThrow();
    });
  });

  describe('Logger Interface Compliance', () => {
    it('should implement all required methods', () => {
      const logger = createTestLogger();

      // Check that all interface methods exist
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.child).toBe('function');
    });

    it('should return valid child logger', () => {
      const logger = createTestLogger();
      const child = logger.child({ test: 'context' });

      expect(typeof child.debug).toBe('function');
      expect(typeof child.info).toBe('function');
      expect(typeof child.warn).toBe('function');
      expect(typeof child.error).toBe('function');
      expect(typeof child.child).toBe('function');
    });
  });
});
