const express = require('express');
const apiUserController = require('../controllers/apiUser.controller');
const apiJobPostingController = require('../controllers/apiJobPosting.controller');
const apiApplicationController = require('../controllers/apiApplication.controller');
const { validateJobPosting } = require('../middlewares/jobValidation.middleware');

const router = express.Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users API (REST)
 *     summary: Retrieve all users (JSON)
 *     description: Returns a JSON array of all active users in the in-memory store.
 *     responses:
 *       200:
 *         description: A JSON array of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     tags:
 *       - Users API (REST)
 *     summary: Create a new user (JSON)
 *     description: Validates payload and creates a new user, returning 201 Created with the assigned UUID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: User with provided email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', apiUserController.getUsers);
router.post('/', apiUserController.createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users API (REST)
 *     summary: Get a user by ID (JSON)
 *     description: Retrieves the JSON representation of the user matching the supplied UUID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique UUID of the user
 *     responses:
 *       200:
 *         description: User found and returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Users API (REST)
 *     summary: Full update of an existing user (JSON)
 *     description: Replaces all mutable attributes (name, email, role) of the user matching the supplied ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique UUID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email conflict with another user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags:
 *       - Users API (REST)
 *     summary: Partial update of an existing user (JSON)
 *     description: Modifies one or more fields (name, email, role) of the user matching the supplied ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique UUID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email conflict with another user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Users API (REST)
 *     summary: Delete a user by ID (JSON)
 *     description: Permanently removes the user matching the supplied ID from the in-memory store.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique UUID of the user
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *                 id:
 *                   type: string
 *                   example: 11111111-1111-4111-a111-111111111111
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', apiUserController.getUserById);
router.put('/:id', apiUserController.updateUser);
router.patch('/:id', apiUserController.patchUser);
router.delete('/:id', apiUserController.deleteUser);

/**
 * @openapi
 * /api/users/{id}/jobs:
 *   get:
 *     tags:
 *       - Jobs API (REST)
 *     summary: Retrieve all job postings authored by a specific user
 *     description: Nested endpoint returning all job listings published by user :id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author user UUID
 *     responses:
 *       200:
 *         description: List of jobs authored by user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobPosting'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Jobs API (REST)
 *     summary: Create a job posting under a specific user
 *     description: Nested endpoint for creating a job vacancy. Extracts user_id strictly from path parameter :id, ignoring any userId in request body.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author user UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - company
 *             properties:
 *               title:
 *                 type: string
 *                 example: Full Stack Engineer
 *               company:
 *                 type: string
 *                 example: Stripe
 *               location:
 *                 type: string
 *                 example: Remote / San Francisco
 *               description:
 *                 type: string
 *                 example: Building modern payment infrastructures with Node.js and PostgreSQL.
 *     responses:
 *       201:
 *         description: Job posting created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobPosting'
 *       400:
 *         description: Validation error or missing fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/jobs', apiJobPostingController.getUserJobs);
router.post('/:id/jobs', validateJobPosting, apiJobPostingController.createUserJob);

/**
 * @openapi
 * /api/users/{id}/applications:
 *   get:
 *     tags:
 *       - Applications API (REST)
 *     summary: Retrieve all applications submitted by a specific user
 *     description: Nested endpoint returning all applications submitted by candidate user :id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Candidate user UUID
 *     responses:
 *       200:
 *         description: List of applications submitted by the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/applications', apiApplicationController.getUserApplications);

module.exports = router;

