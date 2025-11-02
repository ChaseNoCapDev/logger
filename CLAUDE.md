# CLAUDE.md - Logger Package

This file provides guidance to Claude Code when working with the logger package.

## Package Overview

The logger package provides Winston-based logging with daily rotation, structured logging, and child logger support. This is a published package on GitHub Packages (`@chasenocap/logger`).

### Purpose
Centralized logging functionality with structured output, daily rotation, and context-aware child loggers.

### Size & Scope
- **Size**: ~300 lines (well within 1000 line limit)
- **Public Exports**: 4 items (ILogger, WinstonLogger, createLogger, LogLevel)
- **Dependencies**: winston, winston-daily-rotate-file
- **Single Responsibility**: Logging only

## Architecture

### Core Components

1. **ILogger Interface** (`src/interfaces/ILogger.ts`)
   - Standard logging methods (debug, info, warn, error)
   - Child logger creation with additional context
   - Flexible parameter support

2. **WinstonLogger Implementation** (`src/implementations/WinstonLogger.ts`)
   - Winston-based implementation
   - Daily rotating file transport
   - Console transport with colors
   - JSON structured logging

3. **Factory Function** (`src/factories/createLogger.ts`)
   - Convenient logger creation
   - Environment-based configuration
   - Sensible defaults

## Design Decisions

### Structured Logging
All log entries are JSON formatted with:
- `timestamp`: ISO date string
- `level`: Log level (debug, info, warn, error)
- `message`: Primary log message
- `service`: Service identifier
- Additional context fields

### Daily Rotation
- Log files rotate daily
- Kept for 14 days by default
- Compressed older files
- Prevents disk space issues

### Child Loggers
Context inheritance pattern:
```typescript
const parentLogger = createLogger({ service: 'api' });
const childLogger = parentLogger.child({ requestId: '123' });
```

## Configuration

### Environment Variables
- `LOG_LEVEL`: Controls minimum log level (debug, info, warn, error)
- `NODE_ENV`: Affects console output formatting

### Default Configuration
```typescript
{
  level: 'info',
  service: 'app',
  logDirectory: 'logs',
  maxFiles: '14d',
  datePattern: 'YYYY-MM-DD'
}
```

## Usage Patterns

### Basic Usage
```typescript
import { createLogger } from '@chasenocap/logger';

const logger = createLogger({ service: 'my-service' });
logger.info('Application started');
logger.error('Something went wrong', error);
```

### Child Loggers
```typescript
const requestLogger = logger.child({ 
  requestId: 'req-123',
  userId: 'user-456'
});
requestLogger.info('Processing request');
```

### Service Integration
```typescript
@injectable()
class MyService {
  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    this.logger = logger.child({ service: 'MyService' });
  }
}
```

## Testing Strategy

### Unit Tests
- Logger creation and configuration
- Message formatting and structure
- Child logger context inheritance
- Environment variable handling

### Test Utilities
- Console output capture
- Log level filtering verification
- Context propagation testing

## Integration Points

### With DI Framework
```typescript
container.bind<ILogger>(TYPES.ILogger)
  .toConstantValue(createLogger({ service: 'app' }));
```

### With Other Packages
- Used by all services for consistent logging
- Provides context-aware debugging
- Integrates with error handling

## Performance Characteristics

- **Async Logging**: Non-blocking file writes
- **Rotation**: Automatic daily rotation prevents large files
- **Memory**: Minimal memory footprint
- **Transport**: Separate console and file transports

## Publishing Information

### GitHub Packages
- **Package**: `@chasenocap/logger`
- **Registry**: GitHub Packages
- **Access**: Private (requires PAT token)

### Version Management
- Use semantic versioning
- Update version in package.json
- Publish with `npm publish`

### Installation
```bash
npm install @chasenocap/logger
```

## Common Patterns

### Error Logging
```typescript
try {
  // operation
} catch (error) {
  logger.error('Operation failed', error as Error, { context });
}
```

### Request Tracking
```typescript
const requestLogger = logger.child({ requestId, method, path });
requestLogger.info('Request started');
// ... process request
requestLogger.info('Request completed', { duration, status });
```

### Performance Monitoring
```typescript
const start = Date.now();
// ... operation
logger.info('Operation completed', { 
  duration: Date.now() - start,
  operation: 'processData'
});
```

## Best Practices

1. **Use Child Loggers**: Add context rather than inline data
2. **Structured Data**: Pass objects as separate parameters
3. **Consistent Service Names**: Use clear, hierarchical service names
4. **Error Objects**: Always pass Error objects for stack traces
5. **Performance Context**: Include timing and performance data

## Troubleshooting

### Log Files Not Created
- Check directory permissions
- Verify log directory exists
- Check NODE_ENV settings

### Missing Context
- Ensure child loggers are used properly
- Check context inheritance chain
- Verify service names are set

### Performance Issues
- Monitor log file sizes
- Check rotation settings
- Consider log level in production

## Future Enhancements

1. **Remote Logging**: Send logs to external services
2. **Log Aggregation**: Centralized log collection
3. **Structured Queries**: Query interface for logs
4. **Metrics Integration**: Export metrics from logs
5. **Custom Transports**: Additional output formats

## Maintenance Guidelines

1. **Keep It Simple**: Focus only on logging concerns
2. **Backward Compatibility**: Don't break existing APIs
3. **Test Coverage**: Maintain high test coverage
4. **Documentation**: Update examples for new features
5. **Security**: Never log sensitive information