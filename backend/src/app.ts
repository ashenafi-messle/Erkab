import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './core/logging/logger';
import { corsOriginsList } from './config/env';
import { generalLimiter } from './core/middleware/rateLimiter';
import { errorHandler } from './core/middleware/errorHandler';
import { notFoundHandler } from './core/middleware/notFoundHandler';

import webRoutes from './web/routes';
import adminRoutes from './admin/routes';
import healthRoutes from './core/routes/health.routes';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || corsOriginsList.includes(origin) || corsOriginsList.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`Origin '${origin}' not allowed by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging middleware
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url?.startsWith('/api/v1/health') || false,
    },
  })
);

// Body parsers with conservative limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limiting
app.use(generalLimiter);

// API route namespaces
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/web', webRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 & Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
