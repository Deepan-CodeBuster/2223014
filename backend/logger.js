const pino = require('pino');

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

const logger = pino({
  level,
  base: { service: 'url-shortener' },
  timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;
