import pino from 'pino';

const logger = pino({
  browser: {
    asObject: true // logs as JSON objects
  },
  level: 'info'
});

// Middleware wrapper
export const withLogging = (fn, name = 'fn') => {
  return async (...args) => {
    try {
      logger.info({ args }, `${name} called`);
      const result = await fn(...args);
      logger.info({ result }, `${name} success`);
      return result;
    } catch (err) {
      logger.error({ err }, `${name} failed`);
      throw err;
    }
  };
};

export default logger;
