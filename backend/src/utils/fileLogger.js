/**
 * fileLogger.js
 * 
 * Task 6: File-Based Persistent Error Logging
 * 
 * Safely and asynchronously persists backend error details (5xx crashes and 4xx catches)
 * to `logs/error.log` without blocking the Node.js event loop.
 * 
 * Format:
 * [<ISO-Timestamp / HH:MM:SS>] [<METHOD>] [<ROUTE>] [<STATUS_CODE>] Error: <message> | Stack: <stack trace (single-line or formatted)>
 */

const fs = require('fs');
const path = require('path');

// Primary log directory inside backend (and root if applicable)
const BACKEND_LOGS_DIR = path.resolve(__dirname, '../../logs');
const BACKEND_ERROR_LOG = path.join(BACKEND_LOGS_DIR, 'error.log');

// Project root log directory fallback
const ROOT_LOGS_DIR = path.resolve(__dirname, '../../../logs');
const ROOT_ERROR_LOG = path.join(ROOT_LOGS_DIR, 'error.log');

/**
 * Ensures the target logs directory exists
 * @param {string} dirPath
 */
function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    // Non-fatal, handled gracefully
  }
}

// Initialize directory creation at startup
ensureDir(BACKEND_LOGS_DIR);

/**
 * Generates ISO timestamp for structured logging
 * @param {Date} [date]
 * @returns {string}
 */
function getTimestamp(date = new Date()) {
  return date.toISOString();
}

/**
 * Format error into structured log entry:
 * [<ISO-Timestamp / HH:MM:SS>] [<METHOD>] [<ROUTE>] [<STATUS_CODE>] Error: <message> | Stack: <stack trace (single-line or formatted)>
 * 
 * @param {Object} params
 * @param {string} params.method
 * @param {string} params.route
 * @param {number} params.statusCode
 * @param {Error|string} params.err
 * @param {string} [params.timestamp]
 * @returns {string}
 */
function formatErrorEntry({ method = 'GET', route = '/', statusCode = 500, err, timestamp = getTimestamp() }) {
  const errorMessage = typeof err === 'string' ? err : (err?.message || 'Unknown error');
  const rawStack = err?.stack;
  const cleanStack = rawStack
    ? rawStack.replace(/\r?\n\s*/g, ' -> ')
    : 'N/A';

  return `[${timestamp}] [${method.toUpperCase()}] [${route}] [${statusCode}] Error: ${errorMessage} | Stack: ${cleanStack}\n`;
}

/**
 * Asynchronously write error entry to logs/error.log
 * Uses fs.promises.appendFile to prevent blocking the event loop.
 * Wrapped in try-catch to ensure disk/permission issues never crash the server.
 * 
 * @param {Object} params
 * @param {string} params.method
 * @param {string} params.route
 * @param {number} params.statusCode
 * @param {Error|string} params.err
 * @param {string} [params.timestamp]
 * @returns {Promise<string|null>} Formatted log line or null on write failure
 */
async function appendErrorLog(params) {
  const entry = formatErrorEntry(params);

  try {
    ensureDir(BACKEND_LOGS_DIR);
    await fs.promises.appendFile(BACKEND_ERROR_LOG, entry, 'utf8');

    // Also mirror to project root logs directory if accessible
    try {
      if (ROOT_LOGS_DIR !== BACKEND_LOGS_DIR) {
        ensureDir(ROOT_LOGS_DIR);
        await fs.promises.appendFile(ROOT_ERROR_LOG, entry, 'utf8');
      }
    } catch {
      // Secondary write is optional/best-effort
    }

    return entry;
  } catch (writeErr) {
    // Gracefully handle file I/O error without crashing application
    console.error('Failed to append to persistent error log:', writeErr.message);
    return null;
  }
}

/**
 * Read contents of error.log (useful for test assertions)
 * @returns {Promise<string>}
 */
async function readErrorLog() {
  try {
    if (fs.existsSync(BACKEND_ERROR_LOG)) {
      return await fs.promises.readFile(BACKEND_ERROR_LOG, 'utf8');
    }
  } catch {
    // Fall back to empty string
  }
  return '';
}

/**
 * Truncate or clear error.log (useful before test suites)
 */
async function clearErrorLog() {
  try {
    ensureDir(BACKEND_LOGS_DIR);
    await fs.promises.writeFile(BACKEND_ERROR_LOG, '', 'utf8');
    if (fs.existsSync(ROOT_ERROR_LOG)) {
      await fs.promises.writeFile(ROOT_ERROR_LOG, '', 'utf8');
    }
  } catch {
    // Best-effort
  }
}

module.exports = {
  appendErrorLog,
  formatErrorEntry,
  getTimestamp,
  readErrorLog,
  clearErrorLog,
  getErrorLogPath: () => BACKEND_ERROR_LOG,
  getLogsDir: () => BACKEND_LOGS_DIR,
};

