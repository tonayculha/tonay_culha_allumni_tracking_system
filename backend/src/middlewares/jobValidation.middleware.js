/**
 * jobValidation.middleware.js
 * 
 * Input validation middleware for adding and modifying Job Postings.
 * Applies strict business rules across create and update endpoints (POST/PUT /jobs, /api/jobs, etc.).
 * 
 * Business Rules:
 * - "title": string, REQUIRED, maximum length 120 characters.
 * - "company": string, REQUIRED.
 * - "city": optional string.
 * - "description": optional string.
 * 
 * Fails with HTTP 400 Bad Request:
 * { "error": "Validation failed", "details": [...] }
 */

/**
 * Validate job posting payload for both create and update operations
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function validateJobPosting(req, res, next) {
  const details = [];

  // Gracefully handle missing, non-object, or array body
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return sendValidationError(req, res, ['Invalid payload format. Request body must be a valid JSON object.']);
  }

  // Gracefully handle empty JSON body ({})
  if (Object.keys(req.body).length === 0) {
    details.push('Field "title" is required.');
    details.push('Field "company" is required.');
    return sendValidationError(req, res, details);
  }

  const { title, company, city, location, description } = req.body;

  // 1. "title": string, REQUIRED, maximum length 120 characters
  if (title === undefined || title === null) {
    details.push('Field "title" is required.');
  } else if (typeof title !== 'string') {
    details.push('Field "title" must be a string.');
  } else {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      details.push('Field "title" cannot be empty.');
    } else if (trimmedTitle.length > 120 || title.length > 120) {
      details.push('Field "title" must not exceed 120 characters.');
    }
  }

  // 2. "company": string, REQUIRED
  if (company === undefined || company === null) {
    details.push('Field "company" is required.');
  } else if (typeof company !== 'string') {
    details.push('Field "company" must be a string.');
  } else {
    const trimmedCompany = company.trim();
    if (trimmedCompany.length === 0) {
      details.push('Field "company" cannot be empty.');
    }
  }

  // 3. "city": optional string
  if (city !== undefined && city !== null) {
    if (typeof city !== 'string') {
      details.push('Field "city" must be a string if provided.');
    }
  }

  // Backwards compatibility with "location" field
  if (location !== undefined && location !== null) {
    if (typeof location !== 'string') {
      details.push('Field "location" must be a string if provided.');
    }
  }

  // 4. "description": optional string
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      details.push('Field "description" must be a string if provided.');
    }
  }

  if (details.length > 0) {
    return sendValidationError(req, res, details);
  }

  // Normalize city and location
  if (city && !location) {
    req.body.location = city;
  }
  if (location && !city) {
    req.body.city = location;
  }

  return next();
}

/**
 * Return validation error response (JSON 400 for APIs, 302 redirect for HTML form submissions)
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Array<string>} details
 */
function sendValidationError(req, res, details) {
  const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');

  // Maintain redirect behavior for browser-based HTML form submissions
  if (isFormSubmit && !req.originalUrl.startsWith('/api') && !req.xhr) {
    return res.redirect(`/jobs?error=${encodeURIComponent(details.join(', '))}`);
  }

  return res.status(400).json({
    status: 'error',
    error: 'Validation failed',
    message: 'Validation failed for job posting payload',
    details,
  });
}

module.exports = {
  validateJobPosting,
  sendValidationError,
};

