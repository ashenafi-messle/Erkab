import pino from 'pino';
import { env } from '../../config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'headers.authorization',
      'headers.cookie',
      'password',
      'token',
      'apiKey',
      'apiSecret',
      'secret',
      '*.password',
      '*.token',
      '*.apiKey',
      '*.apiSecret',
      '*.CLOUDINARY_API_SECRET',
      'CLOUDINARY_API_SECRET',
    ],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
