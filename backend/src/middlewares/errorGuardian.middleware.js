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
      <link rel="stylesheet" href="/css/tokens.css">
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <header>
        <div class="nav-container">
          <a href="/home" class="brand" aria-label="Alumni Hub Home">
            <span class="brand-crest" aria-hidden="true">AH</span>
            <span>Alumni Hub</span>
            <span class="brand-badge brand-badge-danger">Error ${statusCode}</span>
          </a>
          <nav class="primary-nav" aria-label="Primary navigation">
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/users">Directory</a></li>
              <li><a href="/jobs">Opportunities</a></li>
              <li><a href="/applications">Applications</a></li>
              <li><a href="/announcements">Bulletins</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <div class="error-shell">
          <section class="error-card">
            <span class="badge badge-priority-urgent">System Guardian</span>
            <h1 class="error-code">Error ${statusCode}</h1>
            <h2 class="error-title">${statusCode >= 500 ? 'Internal Server Error' : 'An error occurred'}</h2>
            <p class="error-desc">
              ${statusCode >= 500 ? 'A server-side error occurred while processing your request.' : err.message}
            </p>
            <div class="error-reason">
              ${err.message || 'Unexpected server error'}
            </div>
            <div class="btn-group" style="justify-content: center;">
              <a href="/home" class="btn btn-primary">Return to Home</a>
              <a href="/jobs" class="btn btn-secondary">Browse Jobs</a>
            </div>
          </section>
        </div>
      </main>
    </body>
    </html>
  `);
}

module.exports = errorGuardian;

