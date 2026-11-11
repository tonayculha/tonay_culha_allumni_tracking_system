/**
 * notFoundHandler.js
 * 
 * Re-exports notFoundGuardian middleware for backward compatibility.
 */
const notFoundGuardian = require('./notFoundGuardian.middleware');

module.exports = notFoundGuardian;
