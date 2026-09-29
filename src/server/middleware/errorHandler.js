import { logger } from '../utils/logger.js';
import { errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { config } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Exception on ${req.method} ${req.originalUrl}: ${err.message}`, err);

  if (res.headersSent) {
    return next(err);
  }

  // Handle Syntax Errors in Body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Malformed JSON payload in request body.', API_ERROR_CODES.BAD_REQUEST, HTTP_STATUS.BAD_REQUEST);
  }

  const details = config.isDev ? { stack: err.stack } : {};
  return errorResponse(
    res,
    config.isDev ? err.message : 'An internal server error occurred. Please try again or contact support.',
    API_ERROR_CODES.INTERNAL_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details
  );
}

export function notFoundHandler(req, res) {
  return errorResponse(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    API_ERROR_CODES.NOT_FOUND,
    HTTP_STATUS.NOT_FOUND
  );
}
