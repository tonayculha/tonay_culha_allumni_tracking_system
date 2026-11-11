const express = require('express');
const apiJobPostingController = require('../controllers/apiJobPosting.controller');
const apiApplicationController = require('../controllers/apiApplication.controller');
const { validateJobPosting } = require('../middlewares/jobValidation.middleware');

const router = express.Router();

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     tags:
 *       - Jobs API (REST)
 *     summary: Retrieve all job postings
 *     description: Returns a list of all active career postings, ordered reverse-chronologically. Supports optional filters.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter job postings by authoring user UUID
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Case-insensitive search on company name
 *     responses:
 *       200:
 *         description: List of job postings retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobPosting'
 *   post:
 *     tags:
 *       - Jobs API (REST)
 *     summary: Create a new job posting directly
 *     description: Directly creates a job vacancy. Requires userId in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobPostingInput'
 *     responses:
 *       201:
 *         description: Job posting created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobPosting'
 *       400:
 *         description: Validation error or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Authoring user not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', apiJobPostingController.getJobs);
router.post('/', validateJobPosting, apiJobPostingController.createJob);
router.put('/', validateJobPosting, (req, res, next) => {
  if (req.body && (req.body.id || req.query.id)) {
    req.params.id = req.body.id || req.query.id;
    return apiJobPostingController.updateJob(req, res, next);
  }
  return res.status(400).json({
    status: 'error',
    error: 'Validation failed',
    message: 'Job ID is required for update.',
    details: ['Job ID must be specified in the route path (/api/jobs/:id) or payload.'],
  });
});

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     tags:
 *       - Jobs API (REST)
 *     summary: Get job posting by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique UUID of the job posting
 *     responses:
 *       200:
 *         description: Job posting details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobPosting'
 *       404:
 *         description: Job posting not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Jobs API (REST)
 *     summary: Update an existing job posting
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJobPostingInput'
 *     responses:
 *       200:
 *         description: Job posting updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobPosting'
 *       400:
 *         description: Invalid field values.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job posting not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Jobs API (REST)
 *     summary: Delete a job posting
 *     description: Permanently removes the job posting. Cascades to delete all associated applications.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job posting deleted successfully.
 *       404:
 *         description: Job posting not found.
 */
router.get('/:id', apiJobPostingController.getJobById);
router.put('/:id', validateJobPosting, apiJobPostingController.updateJob);
router.delete('/:id', apiJobPostingController.deleteJob);

/**
 * @openapi
 * /api/jobs/{id}/applications:
 *   get:
 *     tags:
 *       - Applications API (REST)
 *     summary: List all applications for a specific job posting
 *     description: Nested endpoint retrieving all candidate applications submitted for job :id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the job posting
 *     responses:
 *       200:
 *         description: List of applications for this job posting.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       404:
 *         description: Job posting not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Applications API (REST)
 *     summary: Submit an application to a specific job posting
 *     description: Nested endpoint for applying to job :id. Candidate userId is provided in request body. Enforces single application rule.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Target job posting UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: 44444444-4444-4444-a444-444444444444
 *               status:
 *                 type: string
 *                 enum: [applied, interview, accepted, rejected]
 *                 default: applied
 *     responses:
 *       201:
 *         description: Application created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Validation error or invalid UUID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job posting or User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Duplicate application conflict.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictErrorResponse'
 */
router.get('/:id/applications', apiApplicationController.getJobApplications);
router.post('/:id/applications', apiApplicationController.createJobApplication);

module.exports = router;
