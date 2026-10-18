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

// Security headers (allow cross-origin for REST API consumers)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Dynamic origin matcher supporting Vercel and production domains
const isAllowedOrigin = (origin: string): boolean => {
  if (corsOriginsList.includes(origin) || corsOriginsList.includes('*')) return true;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  if (origin.endsWith('erkab.org') || origin.endsWith('.erkab.org')) return true;
  if (origin.endsWith('.vercel.app') || origin.endsWith('vercel.app')) return true;
  if (origin.endsWith('.onrender.com') || origin.endsWith('onrender.com')) return true;
  return false;
};

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    logger.warn({ origin }, 'Origin not allowed by CORS policy');
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Logging middleware
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) =>
        req.url?.startsWith('/api/v1/health') ||
        req.url?.startsWith('/api/health') ||
        req.url?.startsWith('/health') ||
        false,
    },
  })
);

// Body parsers with conservative limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limiting
app.use(generalLimiter);

// Root endpoint for status / health check ping
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'Erkab Backend API',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      web: '/api/v1/web',
      admin: '/api/v1/admin',
    },
    timestamp: new Date().toISOString(),
  });
});

// API route namespaces with aliases (supports both /api/v1/admin and /admin prefixes)
app.use(['/api/v1/health', '/api/health', '/health'], healthRoutes);
app.use(['/api/v1/web', '/api/web', '/web'], webRoutes);
app.use(['/api/v1/admin', '/api/admin', '/admin'], adminRoutes);

// Direct contact route alias for backward compatibility
app.use(['/api/v1/contact', '/api/contact', '/contact'], (req, res, next) => {
  req.url = '/contact';
  return webRoutes(req, res, next);
});

// 404 & Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
