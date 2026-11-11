/**
 * notFoundGuardian.middleware.js
 * 
 * Task 4 & Task 7: 404 Guardian & Generic 404 Page Middleware
 * 
 * Captures any unmapped or non-existent routes across the Express application
 * and returns an HTTP 404 Not Found response containing an explicit reason.
 * 
 * - For JSON/API requests (matching /api/*, req.xhr, or accepting JSON):
 *   Preserves REST semantics and returns structured JSON:
 *   {
 *     "status": "error",
 *     "error": "Not Found",
 *     "reason": "The requested resource or endpoint '<method> <path>' does not exist on this server.",
 *     "path": "<path>",
 *     "method": "<method>"
 *   }
 * 
 * - For browser/HTML requests:
 *   Renders the clean, user-friendly 404 page (views/404.html / public/404.html) with HTTP status 404,
 *   navigation buttons ("Go Back to Home/Jobs"), and a 5-second automatic countdown redirect.
 */

const fs = require('fs');
const path = require('path');
const { appendErrorLog } = require('../utils/fileLogger');

const view404Path = path.resolve(__dirname, '../views/404.html');
const public404Path = path.resolve(__dirname, '../../public/404.html');

let cached404Template = null;

/**
 * Load and hydrate the 404 HTML view with dynamic request reason
 * @param {string} reason
 * @returns {string}
 */
function get404Html(reason) {
  if (!cached404Template) {
    if (fs.existsSync(view404Path)) {
      cached404Template = fs.readFileSync(view404Path, 'utf8');
    } else if (fs.existsSync(public404Path)) {
      cached404Template = fs.readFileSync(public404Path, 'utf8');
    }
  }

  if (cached404Template) {
    return cached404Template.replace(
      /<!-- REASON_PLACEHOLDER -->[\s\S]*?(?=<\/div>)/,
      reason
    );
  }

  // Resilient fallback template
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Not Found (404) | Alumni System</title>
  <meta http-equiv="refresh" content="5; url=/jobs">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <main style="text-align: center; padding-top: 5rem; max-width: 600px; margin: 0 auto;">
    <h1 style="font-size: 4rem; color: #ef4444;">404</h1>
    <h2>Page Not Found (404) &bull; Route Not Found</h2>
    <p style="color: #64748b; margin: 1rem 0 2rem;">${reason}</p>
    <div style="display: flex; gap: 1rem; justify-content: center;">
      <a href="/home" class="btn btn-primary" style="text-decoration: none; padding: 0.6rem 1.25rem; background: #2563eb; color: #fff;">Go Back to Home</a>
      <a href="/jobs" class="btn btn-secondary" style="text-decoration: none; padding: 0.6rem 1.25rem; background: #f1f5f9; color: #334155;">Browse Jobs</a>
    </div>
  </main>
</body>
</html>`;
}

/**
 * 404 Guardian Middleware
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function notFoundGuardian(req, res, next) {
  const method = req.method || 'GET';
  const reqPath = req.originalUrl || req.url || '/';
  const reason = `The requested resource or endpoint '${method} ${reqPath}' does not exist on this server.`;

  // Task 6: Persist 404 guardian catch to logs/error.log asynchronously
  appendErrorLog({
    method,
    route: reqPath,
    statusCode: 404,
    err: reason,
  }).catch(() => {});

  const isApiOrJson =
    reqPath.startsWith('/api') ||
    Boolean(req.xhr) ||
    Boolean(typeof req.is === 'function' && req.is('json')) ||
    Boolean(req.headers?.['content-type']?.includes('application/json')) ||
    Boolean(req.headers?.accept && req.headers.accept.includes('application/json')) ||
    Boolean(typeof req.accepts === 'function' && !req.accepts('html'));

  if (isApiOrJson) {
    return res.status(404).json({
      status: 'error',
      error: 'Not Found',
      reason,
      message: reason,
      path: reqPath,
      method,
    });
  }

  // Browser / HTML client request: render generic 404 page
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(404).send(get404Html(reason));
}

module.exports = notFoundGuardian;
