const path = require('path');
const fs = require('fs');
const { jobPostingService } = require('../services/jobPosting.service');
const userService = require('../services/user.service');

const viewsPath = path.resolve(__dirname, '../views');

/**
 * JobController
 * 
 * MVC View Controller for the Job Postings domain.
 * Serves semantic HTML5 views, pre-hydrates initial job listings and active users
 * for instant zero-flicker client rendering, and handles form submissions.
 * 
 * Mapped to: /jobs
 */

/**
 * GET /jobs
 * Serves jobs.html with embedded initial jobs and users state
 */
const getJobsView = async (req, res, next) => {
  try {
    const [jobs, users] = await Promise.all([
      jobPostingService.getAllJobPostings(),
      userService.getAllUsers(),
    ]);

    const filePath = path.join(viewsPath, 'jobs.html');
    if (!fs.existsSync(filePath)) {
      return res.status(500).send('<h1>500 Internal Server Error</h1><p>View jobs.html not found.</p>');
    }

    let html = fs.readFileSync(filePath, 'utf8');

    // Server-Side Hydration: inject initial seed data
    const jobsScript = `<script id="initial-jobs-data" type="application/json">${JSON.stringify(jobs)}</script>`;
    const usersScript = `<script id="initial-users-data" type="application/json">${JSON.stringify(users)}</script>`;

    if (html.includes('<!-- INITIAL_JOBS_DATA -->')) {
      html = html.replace('<!-- INITIAL_JOBS_DATA -->', `${jobsScript}\n  ${usersScript}`);
    } else {
      html = html.replace('</head>', `  ${jobsScript}\n  ${usersScript}\n</head>`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /jobs/:id
 * Job detail view or redirection with view query
 */
const getJobDetailView = async (req, res, next) => {
  try {
    const job = await jobPostingService.getJobPostingById(req.params.id);

    if (req.accepts('html') && !req.xhr && !req.headers['content-type']?.includes('application/json')) {
      return res.redirect(`/jobs?view=${encodeURIComponent(job.id)}`);
    }

    return res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /jobs
 * Handles creation via standard HTML forms or AJAX
 */
const handleCreateJob = async (req, res, next) => {
  try {
    const { userId, user_id, title, company, location, description, city } = req.body || {};
    const authorId = userId || user_id;

    const newJob = await jobPostingService.createJobPosting({
      userId: authorId,
      title,
      company,
      location: city || location,
      city,
      description,
    });

    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect('/jobs?status=created');
    }

    return res.status(201).json(newJob);
  } catch (error) {
    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect(`/jobs?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

/**
 * POST /jobs/:id/delete or DELETE /jobs/:id
 * Handles deletion from HTML form actions or view AJAX
 */
const handleDeleteJob = async (req, res, next) => {
  try {
    await jobPostingService.deleteJobPosting(req.params.id);

    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect('/jobs?status=deleted');
    }

    return res.status(200).json({
      status: 'success',
      message: 'Job posting deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    const isFormSubmit = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    if (isFormSubmit || (req.accepts('html') && !req.xhr)) {
      return res.redirect(`/jobs?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

module.exports = {
  getJobsView,
  getJobDetailView,
  handleCreateJob,
  handleDeleteJob,
};
