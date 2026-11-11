const { jobPostingService } = require('../services/jobPosting.service');

/**
 * ApiJobPostingController
 * 
 * REST API controller for Job Postings (both direct and user-nested routing).
 */

/**
 * GET /api/jobs
 * List all job postings with optional query filters
 */
const getJobs = async (req, res, next) => {
  try {
    const jobs = await jobPostingService.getAllJobPostings(req.query);
    return res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/jobs/:id
 * Retrieve single job posting by UUID
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await jobPostingService.getJobPostingById(req.params.id);
    return res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/jobs
 * Direct creation of job posting (requires userId in request body)
 */
const createJob = async (req, res, next) => {
  try {
    const { userId, user_id, title, company, location, description, city } = req.body || {};
    const effectiveUserId = userId || user_id;

    const job = await jobPostingService.createJobPosting({
      userId: effectiveUserId,
      title,
      company,
      location: city || location,
      city,
      description,
    });
    return res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/jobs
 * Retrieve all job postings authored by a specific user
 */
const getUserJobs = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const jobs = await jobPostingService.getJobPostingsByUserId(userId);
    return res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/:id/jobs
 * Nested creation of job posting under a user.
 * STRICT BUSINESS RULE: Extract user_id strictly from req.params.id,
 * ignoring any userId passed in req.body.
 */
const createUserJob = async (req, res, next) => {
  try {
    const userId = req.params.id; // Strictly from path parameter
    const { title, company, location, description, city } = req.body || {};

    const job = await jobPostingService.createJobPosting({
      userId,
      title,
      company,
      location: city || location,
      city,
      description,
    });
    return res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/jobs/:id
 * Full update of existing job posting
 */
const updateJob = async (req, res, next) => {
  try {
    const targetId = req.params.id || req.body?.id;
    const updated = await jobPostingService.updateJobPosting(targetId, req.body || {});
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/jobs/:id
 * Delete job posting by UUID
 */
const deleteJob = async (req, res, next) => {
  try {
    await jobPostingService.deleteJobPosting(req.params.id);
    return res.status(200).json({
      status: 'success',
      message: 'Job posting deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  getUserJobs,
  createUserJob,
  updateJob,
  deleteJob,
};
