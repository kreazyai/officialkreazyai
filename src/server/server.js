import { createApp } from './app/app.js';
import { config } from './config/env.js';
import { getDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    // 1. Initialize Relational Database
    getDatabase();

    // 2. Instantiate Express App
    const app = createApp();

    // 3. Start HTTP Server
    const server = app.listen(config.port, () => {
      logger.info(`============================================================`);
      logger.info(`KREAZYAI PRODUCTION REST API SERVER RUNNING ON PORT ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${config.port}/api/health`);
      logger.info(`API Base:     http://localhost:${config.port}/api/v1`);
      logger.info(`============================================================`);
    });

    // Graceful Shutdown
    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (err) {
    logger.error('Fatal crash during server initialization:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
