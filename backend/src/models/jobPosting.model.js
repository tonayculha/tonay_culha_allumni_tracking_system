const { query } = require('../config/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * JobPostingModel
 * 
 * Model layer for JobPosting entity backed by PostgreSQL 16 database.
 * Represents career listings authored by users (1:N relationship).
 */
class JobPostingModel {
  /**
   * Helper to check valid UUID format
   * @param {string} id
   * @returns {boolean}
   */
  _isValidUuid(id) {
    return typeof id === 'string' && UUID_REGEX.test(id.trim());
  }

  /**
   * Normalize database row to standard domain object
   * @param {Object} row
   * @returns {Object|null}
   */
  _mapJob(row) {
    if (!row) return null;
    const createdAtIso = row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString();
    const updatedAtIso = row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString();
    return {
      id: row.id,
      userId: row.user_id,
      user_id: row.user_id,
      title: row.title,
      company: row.company,
      location: row.location || null,
      city: row.location || null,
      description: row.description || null,
      authorName: row.author_name || null,
      authorEmail: row.author_email || null,
      createdAt: createdAtIso,
      updatedAt: updatedAtIso,
      created_at: createdAtIso,
      updated_at: updatedAtIso,
    };
  }

  /**
   * Retrieve job postings with optional filters
   * @param {Object} [filters]
   * @param {string} [filters.userId]
   * @param {string} [filters.company]
   * @returns {Promise<Array<Object>>}
   */
  async findAll(filters = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.userId && this._isValidUuid(filters.userId)) {
      conditions.push(`j.user_id = $${idx++}`);
      values.push(filters.userId.trim());
    }

    if (filters.company && typeof filters.company === 'string') {
      conditions.push(`LOWER(j.company) LIKE LOWER($${idx++})`);
      values.push(`%${filters.company.trim()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT j.id, j.user_id, j.title, j.company, j.location, j.description, j.created_at, j.updated_at,
                        u.name AS author_name, u.email AS author_email
                 FROM job_postings j
                 LEFT JOIN users u ON j.user_id = u.id
                 ${whereClause} 
                 ORDER BY j.created_at DESC`;

    const res = await query(sql, values);
    return res.rows.map((row) => this._mapJob(row));
  }

  /**
   * Find a single job posting by UUID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    if (!this._isValidUuid(id)) return null;
    const res = await query(
      `SELECT j.id, j.user_id, j.title, j.company, j.location, j.description, j.created_at, j.updated_at,
              u.name AS author_name, u.email AS author_email
       FROM job_postings j
       LEFT JOIN users u ON j.user_id = u.id
       WHERE j.id = $1`,
      [id.trim()]
    );
    if (!res.rows || res.rows.length === 0) return null;
    return this._mapJob(res.rows[0]);
  }

  /**
   * Find all job postings published by a specific user
   * @param {string} userId
   * @returns {Promise<Array<Object>>}
   */
  async findByUserId(userId) {
    if (!this._isValidUuid(userId)) return [];
    const res = await query(
      `SELECT j.id, j.user_id, j.title, j.company, j.location, j.description, j.created_at, j.updated_at,
              u.name AS author_name, u.email AS author_email
       FROM job_postings j
       LEFT JOIN users u ON j.user_id = u.id
       WHERE j.user_id = $1 
       ORDER BY j.created_at DESC`,
      [userId.trim()]
    );
    return res.rows.map((row) => this._mapJob(row));
  }

  /**
   * Create and persist a new job posting in PostgreSQL
   * @param {Object} jobData
   * @param {string} jobData.userId
   * @param {string} jobData.title
   * @param {string} jobData.company
   * @param {string} [jobData.location]
   * @param {string} [jobData.description]
   * @returns {Promise<Object>}
   */
  async create({ userId, title, company, location = null, description = null }) {
    const cleanUserId = userId ? userId.trim() : null;
    const cleanTitle = title ? title.trim() : '';
    const cleanCompany = company ? company.trim() : '';
    const cleanLocation = location ? location.trim() : null;
    const cleanDescription = description ? description.trim() : null;

    const res = await query(
      `INSERT INTO job_postings (id, user_id, title, company, location, description, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, user_id, title, company, location, description, created_at, updated_at`,
      [cleanUserId, cleanTitle, cleanCompany, cleanLocation, cleanDescription]
    );

    return this._mapJob(res.rows[0]);
  }

  /**
   * Update existing job posting record
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async update(id, data = {}) {
    if (!this._isValidUuid(id)) return null;

    const sets = [];
    const values = [id.trim()];
    let idx = 2;

    if (data.title !== undefined) {
      sets.push(`title = $${idx++}`);
      values.push(data.title.trim());
    }
    if (data.company !== undefined) {
      sets.push(`company = $${idx++}`);
      values.push(data.company.trim());
    }
    const targetLocation = data.location !== undefined ? data.location : data.city;
    if (targetLocation !== undefined) {
      sets.push(`location = $${idx++}`);
      values.push(targetLocation ? targetLocation.trim() : null);
    }
    if (data.description !== undefined) {
      sets.push(`description = $${idx++}`);
      values.push(data.description ? data.description.trim() : null);
    }

    if (sets.length === 0) {
      return this.findById(id);
    }

    sets.push(`updated_at = NOW()`);
    const sql = `UPDATE job_postings 
                 SET ${sets.join(', ')} 
                 WHERE id = $1 
                 RETURNING id, user_id, title, company, location, description, created_at, updated_at`;

    const res = await query(sql, values);
    if (!res.rows || res.rows.length === 0) return null;
    return this._mapJob(res.rows[0]);
  }

  /**
   * Delete job posting by UUID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    if (!this._isValidUuid(id)) return false;
    const res = await query('DELETE FROM job_postings WHERE id = $1', [id.trim()]);
    return res.rowCount > 0;
  }

  // Static convenience wrappers
  static findAll(filters) { return jobPostingModel.findAll(filters); }
  static findById(id) { return jobPostingModel.findById(id); }
  static findByUserId(userId) { return jobPostingModel.findByUserId(userId); }
  static create(data) { return jobPostingModel.create(data); }
  static update(id, data) { return jobPostingModel.update(id, data); }
  static delete(id) { return jobPostingModel.delete(id); }
}

const jobPostingModel = new JobPostingModel();

module.exports = {
  JobPostingModel,
  jobPostingModel,
};
