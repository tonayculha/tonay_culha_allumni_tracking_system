/**
 * errorHandler.js
 * 
 * Re-exports errorGuardian middleware for backward compatibility.
 */
const errorGuardian = require('./errorGuardian.middleware');

module.exports = errorGuardian;
