/**
 * Request Logger Middleware
 *
 * Layer: Interfaces
 * Responsibility: Log incoming HTTP requests using morgan.
 */

import morgan from 'morgan';

const format = process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev';

export const requestLogger = morgan(format);
