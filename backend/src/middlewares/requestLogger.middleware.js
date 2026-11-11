/**
 * requestLogger.middleware.js
 * 
 * Custom Express logging middleware.
 * Measures execution duration from request intake to response finish (res.on('finish')).
 * 
 * Formatted output:
 * <time> <method> <route> <restype> <duration>
 * Example:
 * 10:20:32 POST /jobs 201 18ms
 */

/**
 * Format Date to local time string (HH:MM:SS) using 24-hour time
 * @param {Date} [date]
 * @returns {string}
 */
function getLocalTimeString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Custom Request Logger Middleware
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestLogger(req, res, next) {
  const startTime = process.hrtime.bigint();

  let logged = false;
  res.on('finish', () => {
    if (logged) return;
    logged = true;

    const elapsedNs = process.hrtime.bigint() - startTime;
    const durationMs = Math.round(Number(elapsedNs) / 1e6);

    const time = getLocalTimeString(new Date());
    const method = req.method;
    const route = req.originalUrl || (req.baseUrl ? req.baseUrl + req.path : req.path) || req.url || '/';
    const restype = res.statusCode;
    const duration = `${durationMs}ms`;

    console.log(`${time} ${method} ${route} ${restype} ${duration}`);
  });

  next();
}

module.exports = {
  requestLogger,
  getLocalTimeString,
};

