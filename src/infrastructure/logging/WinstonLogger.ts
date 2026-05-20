/**
 * WinstonLogger
 *
 * Layer: Infrastructure
 * Responsibility: Application-wide structured logger.
 * Wraps winston so no other layer imports it directly.
 */

import winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const isDev = process.env['NODE_ENV'] !== 'production';

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${String(ts)} [${level}]: ${String(message)}${stack ? `\n${String(stack)}` : ''}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] ?? 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
});
