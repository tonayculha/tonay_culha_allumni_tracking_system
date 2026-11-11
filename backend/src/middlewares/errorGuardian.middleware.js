/**
 * errorGuardian.middleware.js
 * 
 * Task 5: 5xx Guardian Middleware (Global Error Handler)
 * 
 * Registered as the absolute LAST middleware in Express with exactly 4 parameters (err, req, res, next).
 * Catches all unhandled synchronous/asynchronous runtime errors, database query failures,
 * and exceptions forwarded via next(err).
 * 
 * Standardized 5xx JSON Envelope:
 * {
 *   "status": "error",
 *   "error": "Internal Server Error",
 *   "message": "A server-side error occurred while processing your request.",
 *   "reason": err.message || "Unexpected server error",
 *   "path": req.originalUrl,
 *   "method": req.method,
 *   "stack": process.env.NODE_ENV === 'production' ? undefined : err.stack
 * }
 */

const logger = require('../utils/logger');
const config = require('../config/env');
const { appendErrorLog } = require('../utils/fileLogger');

/**
 * 5xx Guardian Middleware (Global Error Handler)
 * 
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorGuardian(err, req, res, next) {
  // Determine HTTP status code: use err.status or err.statusCode, defaulting strictly to 500
  const rawStatus = err.status || err.statusCode;
  const statusCode = typeof rawStatus === 'number' && rawStatus >= 400 && rawStatus <= 599
    ? rawStatus
    : 500;

  const method = req.method || 'GET';
  const path = req.originalUrl || req.url || '/';
  const timestamp = new Date().toISOString();

  // Log unhandled 5xx error details with timestamp to console.error
  if (statusCode >= 500) {
    console.error(`[${timestamp}] 5xx Server Error [${statusCode}] on ${method} ${path}:`, err.stack || err.message || err);
    // Task 6: Persist 5xx server crash to logs/error.log asynchronously
    appendErrorLog({
      method,
      route: path,
      statusCode,
      err,
      timestamp,
    }).catch(() => {});
  } else if (config.env !== 'test') {
    logger.warn(`Client operational error [${statusCode}] on ${method} ${path}: ${err.message}`);
  }

  // Gracefully handle body-parser / express.json SyntaxError (malformed JSON payloads)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      error: 'Validation failed',
      message: 'Malformed JSON payload in request body',
      details: [err.message || 'Invalid JSON syntax in request body'],
    });
  }

  const isJsonExpected =
    path.startsWith('/api') ||
    Boolean(req.xhr) ||
    Boolean(typeof req.is === 'function' && req.is('json')) ||
    Boolean(req.headers?.['content-type']?.includes('application/json')) ||
    Boolean(req.headers?.accept && req.headers.accept.includes('application/json')) ||
    Boolean(typeof req.accepts === 'function' && !req.accepts('html'));

  // 1. JSON / API client error responses
  if (isJsonExpected) {
    if (statusCode >= 500) {
      const responsePayload = {
        status: 'error',
        error: 'Internal Server Error',
        message: 'A server-side error occurred while processing your request.',
        reason: err.message || 'Unexpected server error',
        path,
        method,
      };

      if (process.env.NODE_ENV !== 'production' && err.stack) {
        responsePayload.stack = err.stack;
      }

      return res.status(statusCode).json(responsePayload);
    }

    // Preserve 4xx client errors (ValidationError, NotFoundError, ConflictError)
    return res.status(statusCode).json({
      status: 'error',
      error: err.name || 'Error',
      message: err.message || 'An operational error occurred',
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // 2. Regular Browser / HTML client error responses
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(statusCode).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error ${statusCode} | Alumni System</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <main style="text-align: center; padding-top: 5rem; max-width: 600px; margin: 0 auto; padding-left: 1rem; padding-right: 1rem;">
        <h1 style="font-size: 4rem; color: #ef4444; margin-bottom: 0.5rem;">Error ${statusCode}</h1>
        <h2 style="font-size: 1.75rem; margin-bottom: 1rem; color: #1e293b;">
          ${statusCode >= 500 ? 'Internal Server Error' : 'An error occurred'}
        </h2>
        <p style="color: #64748b; font-size: 1.1rem; margin: 1rem 0 0.5rem; line-height: 1.6;">
          ${statusCode >= 500 ? 'A server-side error occurred while processing your request.' : err.message}
        </p>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 2rem; font-family: monospace;">
          ${err.message || 'Unexpected server error'}
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <a href="/home" class="btn btn-primary" style="text-decoration: none; padding: 0.6rem 1.25rem; border-radius: 6px; background: #2563eb; color: #fff;">Return to Home</a>
          <a href="/jobs" class="btn btn-secondary" style="text-decoration: none; padding: 0.6rem 1.25rem; border-radius: 6px; background: #f1f5f9; color: #334155;">Browse Jobs</a>
        </div>
      </main>
    </body>
    </html>
  `);
}

module.exports = errorGuardian;

