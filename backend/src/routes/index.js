const express = require('express');
const healthRoutes = require('./health.routes');
const greetingRoutes = require('./greeting.routes');
const mathRoutes = require('./math.routes');
const infoRoutes = require('./info.routes');
const apiRoutes = require('./api.routes');
const userRoutes = require('./user.routes');
const announcementRoutes = require('./announcement.routes');
const jobRoutes = require('./job.routes');
const applicationRoutes = require('./application.routes');

const router = express.Router();

// Mount Week 3 & 4 API routes under /api prefix (/api/health, /api/users, /api/announcements, /api/swagger, /api/docs, /api/jobs, /api/applications)
router.use('/api', apiRoutes);

// Mount Week 4 MVC User View routes under /users (Semantic HTML view, UserController)
router.use('/users', userRoutes);

// Mount Week 4 Homework MVC Announcement View routes under /announcements (Semantic HTML view, AnnouncementController)
router.use('/announcements', announcementRoutes);

// Mount Week 6 Homework MVC Job Postings View routes under /jobs (Semantic HTML view, JobController)
router.use('/jobs', jobRoutes);

// Mount Week 6 Homework MVC Applications View routes under /applications (Semantic HTML view, ApplicationController)
router.use('/applications', applicationRoutes);

// Root redirects for documentation convenience
router.get('/docs', (req, res) => res.redirect('/api/docs'));
router.get('/swagger', (req, res) => res.redirect('/api/swagger'));

// Mount domain routes for Week 1 & 2 backwards compatibility
router.use('/', healthRoutes);
router.use('/', infoRoutes);
router.use('/hello', greetingRoutes);
router.use('/sum', mathRoutes);

// Diagnostic/test endpoint for 5xx Guardian HTML rendering
router.get('/error-test', (req, res, next) => {
  const err = new Error(req.query.message || 'Simulated runtime server crash');
  if (req.query.status) {
    err.status = parseInt(req.query.status, 10);
  }
  next(err);
});

module.exports = router;
