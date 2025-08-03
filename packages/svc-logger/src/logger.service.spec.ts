import { Logger } from './logger.service.js';

console.log = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();
console.debug = jest.fn();

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Logger as any)._instance = null;
    window.history.pushState({}, '', '?');
  });

  it('should enable logging if debug parameter is true', () => {
    window.history.pushState({}, '', '?debug=true');
    const logger = Logger.Instance;
    logger.log('test', 'action');
    expect(console.log).toHaveBeenCalled();
  });

  it('should disable logging if debug parameter is not true', () => {
    const logger = Logger.Instance;
    logger.log('test', 'action');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should log messages using log method', () => {
    window.history.pushState({}, '', '?debug=true');
    const logger = Logger.Instance;
    logger.log('test', 'action', 'message');
    expect(console.log).toHaveBeenCalledWith('[test][action]', 'message');
  });

  it('should log informational messages using info method', () => {
    window.history.pushState({}, '', '?debug=true');
    const logger = Logger.Instance;
    logger.info('test', 'action', 'info message');
    expect(console.info).toHaveBeenCalledWith('[test][action]', 'info message');
  });

  it('should log warning messages using warn method', () => {
    window.history.pushState({}, '', '?debug=true');
    const logger = Logger.Instance;
    logger.warn('test', 'action', 'warn message');
    expect(console.warn).toHaveBeenCalledWith('[test][action]', 'warn message');
  });

  it('should log error messages using error method', () => {
    window.history.pushState({}, '', '?debug=true');
    const logger = Logger.Instance;
    logger.error('test', 'action', 'error message');
    expect(console.error).toHaveBeenCalledWith(
      '[test][action]',
      'error message'
    );
  });

  it('should log debug messages using debug method', () => {
    window.history.pushState({}, '', '?debug=true');
    const logger = Logger.Instance;
    logger.debug('test', 'action', 'debug message');
    expect(console.debug).toHaveBeenCalledWith(
      '[test][action]',
      'debug message'
    );
  });
});
