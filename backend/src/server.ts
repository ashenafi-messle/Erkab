import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './core/logging/logger';
import { disconnectDatabase, checkDatabaseHealth } from './core/database/db';
import { ensureNotificationTable } from './prisma/migrateNotifications';
import { ensureContactMessageTable } from './prisma/migrateContact';
import { ensureTutoringPaymentColumns } from './prisma/migrateTutoringPayment';
import { ensureNewsArticleImagesTable } from './prisma/migrateNewsImages';

const server = http.createServer(app);

async function startServer() {
  try {
    const isDbConnected = await checkDatabaseHealth();
    if (isDbConnected) {
      logger.info('Database connection established successfully');
      await ensureNotificationTable();
      await ensureContactMessageTable();
      await ensureTutoringPaymentColumns();
      await ensureNewsArticleImagesTable();
    } else {
      logger.warn('Initial database connectivity check failed. Server will continue in degraded mode.');
    }

    server.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
          apiPrefix: '/api/v1',
        },
        `Erkab Backend Server running on http://localhost:${env.PORT}`
      );

      // Non-blocking Brevo SMTP startup verification (runs in background without delaying startup)
      if (env.NODE_ENV !== 'test') {
        import('./core/services/email.service')
          .then(({ EmailService }) => EmailService.verifySmtpConnection(6000))
          .then((res) => {
            if (res.success) {
              logger.info(
                { host: res.diagnostics.host, port: res.diagnostics.port, verified: true },
                'Brevo SMTP Relay authentication verified successfully'
              );
            } else {
              logger.warn(
                {
                  host: res.diagnostics.host,
                  port: res.diagnostics.port,
                  hasLogin: res.diagnostics.hasLogin,
                  hasKey: res.diagnostics.hasKey,
                  isAuthError: res.diagnostics.isAuthError,
                  errorCode: res.diagnostics.errorCode,
                  error: res.diagnostics.errorMessage,
                },
                'Brevo SMTP Relay verification check completed with status'
              );
            }
          })
          .catch((err) => {
            logger.warn({ err: err.message }, 'Brevo SMTP startup check caught error');
          });
      }
    });
  } catch (err: any) {
    logger.fatal({ err: err.message }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown...');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await disconnectDatabase();
      logger.info('Database connection pool drained');
      process.exit(0);
    } catch (err: any) {
      logger.error({ err: err.message }, 'Error during database disconnection');
      process.exit(1);
    }
  });

  // Force close after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'Uncaught Exception detected');
  process.exit(1);
});

startServer();
