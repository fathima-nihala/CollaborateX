import 'dotenv/config';
import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { environment: NODE_ENV });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});
