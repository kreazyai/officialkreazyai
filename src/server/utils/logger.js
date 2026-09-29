/**
 * Structured Logger with Timestamp, Level and JSON support
 */
export const logger = {
  info(message, meta = {}) {
    console.log(`[INFO]  ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  warn(message, meta = {}) {
    console.warn(`[WARN]  ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  error(message, error = null, meta = {}) {
    const errPayload = error instanceof Error 
      ? { message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined } 
      : error;
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, JSON.stringify({ ...meta, error: errPayload }));
  },
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }
  }
};
