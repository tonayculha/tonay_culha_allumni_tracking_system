const express = require('express');
const healthRoutes = require('./health.routes');
const apiUserRoutes = require('./apiUser.routes');
const apiAnnouncementRoutes = require('./apiAnnouncement.routes');
const apiJobRoutes = require('./apiJob.routes');
const apiApplicationRoutes = require('./apiApplication.routes');
const swaggerRoutes = require('./swagger.routes');

const router = express.Router();

// Mount Health Check under /api/health
router.use('/', healthRoutes);

// Mount In-Memory User CRUD under /api/users (Handled by ApiUserController)
router.use('/users', apiUserRoutes);

// Mount In-Memory Announcement CRUD under /api/announcements (Handled by ApiAnnouncementController)
router.use('/announcements', apiAnnouncementRoutes);

// Mount Job Postings under /api/jobs (Handled by ApiJobPostingController)
router.use('/jobs', apiJobRoutes);

// Mount Applications under /api/applications (Handled by ApiApplicationController)
router.use('/applications', apiApplicationRoutes);

// Mount Swagger & OpenAPI Documentation under /api/swagger, /api/docs
router.use('/', swaggerRoutes);

// Intentionally triggered 5xx error endpoint for testing/diagnostic purposes
router.get('/error-test', (req, res, next) => {
  const err = new Error(req.query.message || 'Simulated runtime server crash');
  if (req.query.status) {
    err.status = parseInt(req.query.status, 10);
  }
  next(err);
});

module.exports = router;
