export class Logger {
  private static _instance: Logger;
  private _enabled: boolean;

  private constructor() {
    const params = new URLSearchParams(window.location.search);
    this._enabled = params.get('debug') === 'true';
  }

  static get Instance(): Logger {
    return Logger._instance || (Logger._instance = new Logger());
  }

  /**
   * Invokes the specified console method if logging is enabled.
   * @param method - The console method to invoke.
   * @param rest - Additional parameters to log.
   * @private
   */
  private do(method: keyof Console, ...rest: unknown[]) {
    if (this._enabled) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console[method] as any).apply(this, rest);
    }
  }

  /**
   * Logs a message to the console with the 'log' method.
   * @param topic - The topic of the log message.
   * @param action - The action associated with the log message.
   * @param rest - Additional parameters to log.
   */
  log(topic: string, action: string, ...rest: unknown[]) {
    this.do('log', `[${topic}][${action}]`, ...rest);
  }

  /**
   * Logs an informational message to the console with the 'info' method.
   * @param topic - The topic of the log message.
   * @param action - The action associated with the log message.
   * @param rest - Additional parameters to log.
   */
  info(topic: string, action: string, ...rest: unknown[]) {
    this.do('info', `[${topic}][${action}]`, ...rest);
  }

  /**
   * Logs a warning message to the console with the 'warn' method.
   * @param topic - The topic of the log message.
   * @param action - The action associated with the log message.
   * @param rest - Additional parameters to log.
   */
  warn(topic: string, action: string, ...rest: unknown[]) {
    this.do('warn', `[${topic}][${action}]`, ...rest);
  }

  /**
   * Logs an error message to the console with the 'error' method.
   * @param topic - The topic of the log message.
   * @param action - The action associated with the log message.
   * @param rest - Additional parameters to log.
   */
  error(topic: string, action: string, ...rest: unknown[]) {
    this.do('error', `[${topic}][${action}]`, ...rest);
  }

  /**
   * Logs a debug message to the console with the 'debug' method.
   * @param topic - The topic of the log message.
   * @param action - The action associated with the log message.
   * @param rest - Additional parameters to log.
   */
  debug(topic: string, action: string, ...rest: unknown[]) {
    this.do('debug', `[${topic}][${action}]`, ...rest);
  }
}
