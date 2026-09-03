const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || 'unknown' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, stack, ...meta }) => {
          let extra = '';
          if (stack) {
            extra = `\n${stack}`;
          } else if (Object.keys(meta).length > 0) {
            extra = ` ${JSON.stringify(meta)}`;
          }
          return `${timestamp} [${service}] ${level}: ${message}${extra}`;
        })
      ),
    }),
  ],
});

module.exports = logger;
