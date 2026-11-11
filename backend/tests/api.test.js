const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_HOST = process.env.TEST_DB_HOST || '127.0.0.1';

const { closePool } = require('../src/config/db');
const { runMigrations } = require('../src/db/migrate');
const { runSeeds } = require('../src/db/seed');
const app = require('../src/app');
const { resetUsers } = require('../src/services/user.service');
const { userModel, UserModel } = require('../src/models/user.model');
const { resetAnnouncements } = require('../src/services/announcement.service');
const { announcementModel, AnnouncementModel } = require('../src/models/announcement.model');
const { jobPostingFactory } = require('../src/db/factories/jobPostingFactory');

describe('Alumni Tracking System API Test Suite', () => {
  let server;
  const baseUrl = 'http://127.0.0.1:3001';

  before(async () => {
    await runMigrations();
    await runSeeds();
    await new Promise((resolve) => {
      server = app.listen(3001, '127.0.0.1', resolve);
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await closePool();
  });

  const apiRequest = (method, path, data = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const reqHeaders = { ...headers };
      let postData = null;

      if (data !== null) {
        postData = typeof data === 'string' ? data : JSON.stringify(data);
        reqHeaders['Content-Type'] = reqHeaders['Content-Type'] || 'application/json';
        reqHeaders['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = http.request(
        url,
        {
          method,
          headers: reqHeaders,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body,
              json: () => (body ? JSON.parse(body) : null),
            });
          });
        }
      );

      req.on('error', reject);
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  };

  const request = (path, headers = {}) => apiRequest('GET', path, null, headers);

  // ==========================================
  // Week 1 & 2 Parity Tests
  // ==========================================
  describe('Health Check Endpoints (Legacy Root)', () => {
    test('GET / returns 200 with status ok and uptime', async () => {
      const res = await request('/');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const data = res.json();
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(typeof data.uptime, 'number');
      assert.ok(data.timestamp);
    });

    test('GET /health returns 200 with status ok and uptime', async () => {
      const res = await request('/health');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const data = res.json();
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(typeof data.uptime, 'number');
    });
  });

  describe('Parametric Greeting Endpoint', () => {
    test('GET /hello/Alice returns personalized greeting', async () => {
      const res = await request('/hello/Alice');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.status, 'success');
      assert.strictEqual(data.name, 'Alice');
      assert.match(data.message, /Hello, Alice!/);
    });

    test('GET /hello/Dr%20Smith handles URL-encoded parameter', async () => {
      const res = await request('/hello/Dr%20Smith');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.name, 'Dr Smith');
      assert.match(data.message, /Hello, Dr Smith!/);
    });
  });

  describe('Calculation Endpoint', () => {
    test('GET /sum/15/27 correctly sums two positive integers', async () => {
      const res = await request('/sum/15/27');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.status, 'success');
      assert.strictEqual(data.operation, 'sum');
      assert.strictEqual(data.number1, 15);
      assert.strictEqual(data.number2, 27);
      assert.strictEqual(data.result, 42);
    });

    test('GET /sum/-10/25 correctly handles negative numbers', async () => {
      const res = await request('/sum/-10/25');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.result, 15);
    });

    test('GET /sum/3.14/2.86 correctly handles floating-point numbers', async () => {
      const res = await request('/sum/3.14/2.86');
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.result, 6);
    });

    test('GET /sum/abc/5 returns 400 Bad Request for non-numeric input', async () => {
      const res = await request('/sum/abc/5');
      assert.strictEqual(res.statusCode, 400);

      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Invalid input');
      assert.strictEqual(data.received.number1, 'abc');
      assert.strictEqual(data.received.number2, '5');
    });

    test('GET /sum/12/xyz returns 400 Bad Request when second param is invalid', async () => {
      const res = await request('/sum/12/xyz');
      assert.strictEqual(res.statusCode, 400);

      const data = res.json();
      assert.strictEqual(data.status, 'error');
    });

    test('GET /sum/foo/bar returns 400 Bad Request when both params are invalid', async () => {
      const res = await request('/sum/foo/bar');
      assert.strictEqual(res.statusCode, 400);

      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.details.length, 2);
    });
  });

  describe('Static & Info Views', () => {
    test('GET /home returns semantic HTML view', async () => {
      const res = await request('/home');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /<title>Alumni Tracking System \| Home<\/title>/);
      assert.match(res.body, /<header>/);
      assert.match(res.body, /<main>/);
      assert.match(res.body, /<footer>/);
    });

    test('GET /about returns semantic HTML view with architecture info', async () => {
      const res = await request('/about');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /About the Project/);
      assert.match(res.body, /One-Command Rule/);
    });
  });

  describe('404 Handling', () => {
    test('GET /unknown-route with JSON accepts header returns 404 JSON', async () => {
      const res = await request('/unknown-route', { Accept: 'application/json' });
      assert.strictEqual(res.statusCode, 404);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Not Found');
      assert.strictEqual(
        data.reason,
        "The requested resource or endpoint 'GET /unknown-route' does not exist on this server."
      );
      assert.strictEqual(data.path, '/unknown-route');
      assert.strictEqual(data.method, 'GET');
    });
  });

  // ==========================================
  // Week 3 Requirements: /api prefix endpoints
  // ==========================================
  describe('Week 3: Health Check Endpoint (/api/health)', () => {
    test('GET /api/health returns 200 with status, timestamp, and uptime', async () => {
      const res = await request('/api/health');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const data = res.json();
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(typeof data.uptime, 'number');
      assert.ok(data.timestamp, 'timestamp must be present');
      assert.ok(data.service, 'service name must be present');
      assert.ok(data.system, 'system diagnostics must be present');
    });
  });

  describe('Week 3: Swagger / OpenAPI Documentation', () => {
    test('GET /api/swagger/ returns 200 with interactive Swagger UI HTML', async () => {
      const res = await request('/api/swagger/');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /swagger-ui/i);
    });

    test('GET /api/docs/ returns 200 with interactive Swagger UI HTML', async () => {
      const res = await request('/api/docs/');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /swagger-ui/i);
    });

    test('GET /api/swagger redirects or resolves to documentation', async () => {
      const res = await request('/api/swagger');
      // Either 301 redirect to /api/swagger/ or 200 directly
      assert.ok([200, 301, 302].includes(res.statusCode));
    });

    test('GET /api/swagger.json returns valid OpenAPI 3.0 specification with user routes', async () => {
      const res = await request('/api/swagger.json');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const spec = res.json();
      assert.strictEqual(spec.openapi, '3.0.0');
      assert.strictEqual(spec.info.title, 'Alumni Tracking System API');
      assert.ok(spec.paths['/users'], 'paths must contain /users');
      assert.ok(spec.paths['/users/{id}'], 'paths must contain /users/{id}');
      assert.ok(spec.paths['/api/users'], 'paths must contain /api/users');
      assert.ok(spec.paths['/api/users/{id}'], 'paths must contain /api/users/{id}');
      assert.ok(spec.paths['/announcements'], 'paths must contain /announcements');
      assert.ok(spec.paths['/announcements/{id}'], 'paths must contain /announcements/{id}');
      assert.ok(spec.paths['/api/announcements'], 'paths must contain /api/announcements');
      assert.ok(spec.paths['/api/announcements/{id}'], 'paths must contain /api/announcements/{id}');
      assert.ok(spec.components.schemas.User, 'schemas must contain User model');
      assert.ok(spec.components.schemas.CreateUserInput, 'schemas must contain CreateUserInput');
      assert.ok(spec.components.schemas.Announcement, 'schemas must contain Announcement model');
      assert.ok(spec.components.schemas.CreateAnnouncementInput, 'schemas must contain CreateAnnouncementInput');
      const tagNames = spec.tags.map((t) => t.name);
      assert.ok(tagNames.includes('Users API (REST)'), 'tags must contain Users API (REST)');
      assert.ok(tagNames.includes('Users View (MVC)'), 'tags must contain Users View (MVC)');
      assert.ok(tagNames.includes('Announcements API (REST)'), 'tags must contain Announcements API (REST)');
      assert.ok(tagNames.includes('Announcements View (MVC)'), 'tags must contain Announcements View (MVC)');
    });
  });

  describe('Week 3: In-Memory User CRUD Operations (/api/users)', () => {
    beforeEach(async () => {
      await resetUsers();
    });

    test('GET /api/users returns initial seed users (at least 3-4 users)', async () => {
      const res = await request('/api/users');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const users = res.json();
      assert.ok(Array.isArray(users), 'Response should be a JSON array of users');
      assert.ok(users.length >= 3, `Expected at least 3 seed users, got ${users.length}`);

      for (const user of users) {
        assert.ok(user.id, 'User must have an id');
        assert.ok(user.name, 'User must have a name');
        assert.ok(user.email, 'User must have an email');
        assert.ok(user.role, 'User must have a role');
        assert.ok(user.createdAt, 'User must have a createdAt timestamp');
      }
    });

    test('POST /api/users creates a new user and returns 201 with generated UUID', async () => {
      const newUserPayload = {
        name: 'Grace Hopper Clone',
        email: 'grace.clone@alumni.edu',
        role: 'faculty',
      };

      const res = await apiRequest('POST', '/api/users', newUserPayload);
      assert.strictEqual(res.statusCode, 201);
      assert.match(res.headers['content-type'], /json/);

      const created = res.json();
      assert.ok(created.id, 'User must have a generated UUID');
      // UUID format check: 8-4-4-4-12 hex characters
      assert.match(created.id, /^[0-9a-fA-F-]{36}$/);
      assert.strictEqual(created.name, newUserPayload.name);
      assert.strictEqual(created.email, newUserPayload.email);
      assert.strictEqual(created.role, newUserPayload.role);
      assert.ok(created.createdAt);

      // Verify the user is now in the array
      const listRes = await request('/api/users');
      const allUsers = listRes.json();
      assert.ok(allUsers.some((u) => u.id === created.id));
    });

    test('POST /api/users returns 400 for invalid/missing fields', async () => {
      // Missing name
      let res = await apiRequest('POST', '/api/users', { email: 'bad@alumni.edu', role: 'student' });
      assert.strictEqual(res.statusCode, 400);

      // Invalid email
      res = await apiRequest('POST', '/api/users', { name: 'Bad Email', email: 'not-an-email', role: 'student' });
      assert.strictEqual(res.statusCode, 400);

      // Missing role
      res = await apiRequest('POST', '/api/users', { name: 'No Role', email: 'norole@alumni.edu' });
      assert.strictEqual(res.statusCode, 400);
    });

    test('POST /api/users returns 409 Conflict when creating with an already registered email', async () => {
      const res = await apiRequest('POST', '/api/users', {
        name: 'Duplicate Ada',
        email: 'ada.lovelace@alumni.edu', // Seed user email
        role: 'student',
      });

      assert.strictEqual(res.statusCode, 409);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'ConflictError');
    });

    test('GET /api/users/:id returns 200 with matching user', async () => {
      const seedId = '11111111-1111-4111-a111-111111111111';
      const res = await request(`/api/users/${seedId}`);
      assert.strictEqual(res.statusCode, 200);

      const user = res.json();
      assert.strictEqual(user.id, seedId);
      assert.strictEqual(user.name, 'Ada Lovelace');
      assert.strictEqual(user.email, 'ada.lovelace@alumni.edu');
    });

    test('GET /api/users/:id returns 404 for unknown user ID', async () => {
      const res = await request('/api/users/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'NotFoundError');
    });

    test('PUT /api/users/:id updates full user and returns 200', async () => {
      const seedId = '22222222-2222-4222-a222-222222222222';
      const updatePayload = {
        name: 'Alan Mathison Turing',
        email: 'alan.turing.updated@alumni.edu',
        role: 'faculty',
      };

      const res = await apiRequest('PUT', `/api/users/${seedId}`, updatePayload);
      assert.strictEqual(res.statusCode, 200);

      const updated = res.json();
      assert.strictEqual(updated.id, seedId);
      assert.strictEqual(updated.name, updatePayload.name);
      assert.strictEqual(updated.email, updatePayload.email);
      assert.strictEqual(updated.role, updatePayload.role);
      assert.ok(updated.updatedAt);

      // Verify persistence in subsequent GET
      const getRes = await request(`/api/users/${seedId}`);
      assert.strictEqual(getRes.json().name, updatePayload.name);
    });

    test('PUT /api/users/:id returns 404 for non-existent ID', async () => {
      const res = await apiRequest('PUT', '/api/users/99999999-9999-9999-9999-999999999999', {
        name: 'Ghost User',
        email: 'ghost@alumni.edu',
        role: 'student',
      });
      assert.strictEqual(res.statusCode, 404);
    });

    test('PATCH /api/users/:id partially updates user and returns 200', async () => {
      const seedId = '33333333-3333-4333-a333-333333333333';
      const res = await apiRequest('PATCH', `/api/users/${seedId}`, {
        role: 'lead-researcher',
      });

      assert.strictEqual(res.statusCode, 200);
      const user = res.json();
      assert.strictEqual(user.id, seedId);
      assert.strictEqual(user.role, 'lead-researcher');
      assert.strictEqual(user.name, 'Grace Hopper'); // unchanged

      // Verify persistence
      const getRes = await request(`/api/users/${seedId}`);
      assert.strictEqual(getRes.json().role, 'lead-researcher');
    });

    test('PATCH /api/users/:id returns 404 for non-existent ID', async () => {
      const res = await apiRequest('PATCH', '/api/users/99999999-9999-9999-9999-999999999999', {
        role: 'student',
      });
      assert.strictEqual(res.statusCode, 404);
    });

    test('DELETE /api/users/:id removes user from store and returns 200', async () => {
      const seedId = '44444444-4444-4444-a444-444444444444';
      const res = await apiRequest('DELETE', `/api/users/${seedId}`);
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.status, 'success');
      assert.strictEqual(data.id, seedId);

      // Verify subsequent GET returns 404
      const getRes = await request(`/api/users/${seedId}`);
      assert.strictEqual(getRes.statusCode, 404);

      // Verify user count decreased in list
      const listRes = await request('/api/users');
      const allUsers = listRes.json();
      assert.ok(!allUsers.some((u) => u.id === seedId));
    });

    test('DELETE /api/users/:id returns 404 when deleting non-existent ID', async () => {
      const res = await apiRequest('DELETE', '/api/users/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
    });

    test('In-memory store ensures immutability against external mutation', async () => {
      const res = await request('/api/users');
      const users = res.json();
      // Attempt to tamper with returned object directly
      users[0].name = 'Hacked Name In Memory';

      // Re-fetch to ensure internal store was not mutated
      const reFetch = await request(`/api/users/${users[0].id}`);
      assert.notStrictEqual(reFetch.json().name, 'Hacked Name In Memory');
    });
  });

  // ==========================================
  // Week 4 Requirements: MVC User Views & Dual Controller
  // ==========================================
  describe('Week 4: MVC User View Layer (/users)', () => {
    beforeEach(async () => {
      await resetUsers();
    });

    test('GET /users returns 200 with semantic HTML page and pre-hydrated users', async () => {
      const res = await request('/users');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /<title>Alumni Tracking System \| Users<\/title>/);
      assert.match(res.body, /User Directory &amp; Management|User Directory/);
      assert.match(res.body, /<table id="users-table">/);
      assert.match(res.body, /Ada Lovelace/);
      assert.match(res.body, /<header>/);
      assert.match(res.body, /<main>/);
      assert.match(res.body, /<footer>/);
    });

    test('POST /users with urlencoded form submission creates user and redirects (302)', async () => {
      const formPayload = 'name=Katherine+Johnson&email=katherine%40alumni.edu&role=faculty';
      const res = await apiRequest('POST', '/users', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/users\?status=created/);

      // Verify user was persisted
      const listRes = await request('/api/users');
      const users = listRes.json();
      assert.ok(users.some((u) => u.email === 'katherine@alumni.edu'));
    });

    test('POST /users with invalid form data redirects with error parameter (302)', async () => {
      const formPayload = 'name=A&email=invalid-email&role=student';
      const res = await apiRequest('POST', '/users', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/users\?error=/);
    });

    test('GET /users/:id with HTML accept header redirects to view query (302)', async () => {
      const seedId = '11111111-1111-4111-a111-111111111111';
      const res = await request(`/users/${seedId}`, { Accept: 'text/html' });
      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, new RegExp(`/users\\?view=${seedId}`));
    });

    test('GET /users/:id with non-existent ID returns 404', async () => {
      const res = await request('/users/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
    });

    test('POST /users/:id/delete with form action deletes user and redirects (302)', async () => {
      const seedId = '33333333-3333-4333-a333-333333333333';
      const res = await apiRequest('POST', `/users/${seedId}/delete`, '', {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/users\?status=deleted/);

      // Verify user is deleted
      const checkRes = await request(`/api/users/${seedId}`);
      assert.strictEqual(checkRes.statusCode, 404);
    });
  });

  // ==========================================
  // Week 4 Requirements: In-Memory UserModel Specification
  // ==========================================
  describe('Week 4: In-Memory UserModel Specification', () => {
    beforeEach(async () => {
      await userModel.reset();
    });

    test('UserModel.findAll returns all seed users defensively cloned', async () => {
      const users = await userModel.findAll();
      assert.ok(Array.isArray(users));
      assert.ok(users.length >= 3);
      assert.strictEqual(users.length, await userModel.count());
    });

    test('UserModel.findById returns target user or null', async () => {
      const user = await userModel.findById('11111111-1111-4111-a111-111111111111');
      assert.ok(user);
      assert.strictEqual(user.name, 'Ada Lovelace');

      const nonExistent = await userModel.findById('non-existent-id');
      assert.strictEqual(nonExistent, null);
    });

    test('UserModel.findByEmail performs case-insensitive lookup', async () => {
      const user = await userModel.findByEmail('ADA.LOVELACE@ALUMNI.EDU');
      assert.ok(user);
      assert.strictEqual(user.id, '11111111-1111-4111-a111-111111111111');

      const notFound = await userModel.findByEmail('missing@alumni.edu');
      assert.strictEqual(notFound, null);
    });

    test('UserModel.create generates record and increments count', async () => {
      const initialCount = await userModel.count();
      const created = await userModel.create({
        name: 'John von Neumann',
        email: 'neumann@alumni.edu',
        role: 'faculty',
      });

      assert.ok(created.id);
      assert.strictEqual(created.name, 'John von Neumann');
      assert.strictEqual(await userModel.count(), initialCount + 1);

      const fetched = await userModel.findById(created.id);
      assert.strictEqual(fetched.name, 'John von Neumann');
    });

    test('UserModel.update modifies properties and updates timestamp', async () => {
      const updated = await userModel.update('22222222-2222-4222-a222-222222222222', {
        name: 'Alan M. Turing',
        role: 'fellow',
      });

      assert.ok(updated);
      assert.strictEqual(updated.name, 'Alan M. Turing');
      assert.strictEqual(updated.role, 'fellow');

      const fetched = await userModel.findById('22222222-2222-4222-a222-222222222222');
      assert.strictEqual(fetched.name, 'Alan M. Turing');
    });

    test('UserModel.delete removes record and decrements count', async () => {
      const initialCount = await userModel.count();
      const success = await userModel.delete('11111111-1111-4111-a111-111111111111');
      assert.strictEqual(success, true);
      assert.strictEqual(await userModel.count(), initialCount - 1);
      assert.strictEqual(await userModel.findById('11111111-1111-4111-a111-111111111111'), null);

      const failed = await userModel.delete('non-existent');
      assert.strictEqual(failed, false);
    });

    test('UserModel enforces strict immutability against external mutations', async () => {
      const users = await userModel.findAll();
      users[0].name = 'Tampered Directly In Memory';

      const verify = await userModel.findById(users[0].id);
      assert.notStrictEqual(verify.name, 'Tampered Directly In Memory');
    });

    test('UserModel static methods delegate properly to singleton instance', async () => {
      assert.strictEqual(typeof UserModel.findAll, 'function');
      const staticUsers = await UserModel.findAll();
      assert.ok(Array.isArray(staticUsers));
      assert.strictEqual(await UserModel.count(), await userModel.count());
    });
  });

  // ==========================================
  // Week 4 Homework: In-Memory Announcement Model Specification
  // ==========================================
  describe('Week 4 Homework: In-Memory Announcement Model Specification', () => {
    beforeEach(async () => {
      await resetAnnouncements();
    });

    test('AnnouncementModel.findAll returns all seed announcements (at least 3)', async () => {
      const items = await announcementModel.findAll();
      assert.ok(Array.isArray(items));
      assert.ok(items.length >= 3, `Expected at least 3 seed items, got ${items.length}`);
      assert.strictEqual(items.length, await announcementModel.count());

      for (const item of items) {
        assert.ok(item.id, 'Announcement must have an id');
        assert.ok(item.title, 'Announcement must have a title');
        assert.ok(item.content, 'Announcement must have content');
        assert.ok(['academic', 'career', 'social'].includes(item.category));
        assert.ok(item.author, 'Announcement must have an author');
        assert.ok(['low', 'normal', 'urgent'].includes(item.priority));
        assert.ok(item.createdAt, 'Announcement must have createdAt timestamp');
      }
    });

    test('AnnouncementModel.findById returns target announcement by UUID or null', async () => {
      const seedId = 'a1111111-1111-4111-a111-111111111111';
      const item = await announcementModel.findById(seedId);
      assert.ok(item);
      assert.strictEqual(item.title, 'Annual Alumni Homecoming 2026');

      const nonExistent = await announcementModel.findById('99999999-9999-9999-9999-999999999999');
      assert.strictEqual(nonExistent, null);
    });

    test('AnnouncementModel.create stores announcement with schema compliance and increments count', async () => {
      const initialCount = await announcementModel.count();
      const created = await announcementModel.create({
        title: 'Spring Research Symposium 2027',
        content: 'Call for undergraduate and graduate research papers across computing sciences.',
        category: 'academic',
        author: 'Dean of Research',
        priority: 'urgent',
      });

      assert.ok(created.id);
      assert.strictEqual(created.title, 'Spring Research Symposium 2027');
      assert.strictEqual(created.category, 'academic');
      assert.strictEqual(created.priority, 'urgent');
      assert.strictEqual(await announcementModel.count(), initialCount + 1);

      const fetched = await announcementModel.findById(created.id);
      assert.strictEqual(fetched.title, 'Spring Research Symposium 2027');
    });

    test('AnnouncementModel.update modifies properties and updates timestamp', async () => {
      const seedId = 'b2222222-2222-4222-a222-222222222222';
      const updated = await announcementModel.update(seedId, {
        title: 'Fall Career Fair 2026 (Updated Schedule)',
        priority: 'urgent',
      });

      assert.ok(updated);
      assert.strictEqual(updated.title, 'Fall Career Fair 2026 (Updated Schedule)');
      assert.strictEqual(updated.priority, 'urgent');
      assert.ok(updated.updatedAt);

      const fetched = await announcementModel.findById(seedId);
      assert.strictEqual(fetched.title, 'Fall Career Fair 2026 (Updated Schedule)');
    });

    test('AnnouncementModel.delete removes target record and decrements count', async () => {
      const seedId = 'c3333333-3333-4333-a333-333333333333';
      const initialCount = await announcementModel.count();
      const success = await announcementModel.delete(seedId);
      assert.strictEqual(success, true);
      assert.strictEqual(await announcementModel.count(), initialCount - 1);
      assert.strictEqual(await announcementModel.findById(seedId), null);

      const fail = await announcementModel.delete('non-existent');
      assert.strictEqual(fail, false);
    });

    test('AnnouncementModel enforces defensive cloning against external mutations', async () => {
      const items = await announcementModel.findAll();
      items[0].title = 'Tampered Directly In Memory';

      const verify = await announcementModel.findById(items[0].id);
      assert.notStrictEqual(verify.title, 'Tampered Directly In Memory');
    });

    test('AnnouncementModel static methods delegate properly to singleton instance', async () => {
      assert.strictEqual(typeof AnnouncementModel.findAll, 'function');
      const staticItems = await AnnouncementModel.findAll();
      assert.ok(Array.isArray(staticItems));
      assert.strictEqual(await AnnouncementModel.count(), await announcementModel.count());
    });
  });

  // ==========================================
  // Week 4 Homework: In-Memory Announcement CRUD Operations (/api/announcements)
  // ==========================================
  describe('Week 4 Homework: In-Memory Announcement CRUD Operations (/api/announcements)', () => {
    beforeEach(async () => {
      await resetAnnouncements();
    });

    test('GET /api/announcements returns initial seed announcements', async () => {
      const res = await request('/api/announcements');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /json/);

      const items = res.json();
      assert.ok(Array.isArray(items));
      assert.ok(items.length >= 3);
    });

    test('POST /api/announcements creates a new announcement and returns 201 with generated UUID', async () => {
      const payload = {
        title: 'Alumni Tech Talk: AI in Production',
        content: 'Engineering deep-dive on modern agentic workflows hosted by senior alumni.',
        category: 'academic',
        author: 'Computer Science Department',
        priority: 'urgent',
      };

      const res = await apiRequest('POST', '/api/announcements', payload);
      assert.strictEqual(res.statusCode, 201);
      assert.match(res.headers['content-type'], /json/);

      const created = res.json();
      assert.ok(created.id);
      assert.match(created.id, /^[0-9a-fA-F-]{36}$/);
      assert.strictEqual(created.title, payload.title);
      assert.strictEqual(created.category, payload.category);
      assert.strictEqual(created.priority, payload.priority);
      assert.ok(created.createdAt);

      // Verify presence in list
      const listRes = await request('/api/announcements');
      const allItems = listRes.json();
      assert.ok(allItems.some((a) => a.id === created.id));
    });

    test('POST /api/announcements returns 400 for invalid/missing fields', async () => {
      // Missing title
      let res = await apiRequest('POST', '/api/announcements', {
        content: 'Valid content long enough',
        category: 'career',
        author: 'Admin',
      });
      assert.strictEqual(res.statusCode, 400);

      // Invalid category
      res = await apiRequest('POST', '/api/announcements', {
        title: 'Valid Title',
        content: 'Valid content long enough',
        category: 'invalid-category',
        author: 'Admin',
      });
      assert.strictEqual(res.statusCode, 400);

      // Invalid priority
      res = await apiRequest('POST', '/api/announcements', {
        title: 'Valid Title',
        content: 'Valid content long enough',
        category: 'social',
        author: 'Admin',
        priority: 'super-urgent',
      });
      assert.strictEqual(res.statusCode, 400);
    });

    test('GET /api/announcements/:id returns 200 with matching item', async () => {
      const seedId = 'a1111111-1111-4111-a111-111111111111';
      const res = await request(`/api/announcements/${seedId}`);
      assert.strictEqual(res.statusCode, 200);

      const item = res.json();
      assert.strictEqual(item.id, seedId);
      assert.strictEqual(item.title, 'Annual Alumni Homecoming 2026');
    });

    test('GET /api/announcements/:id returns 404 for unknown ID', async () => {
      const res = await request('/api/announcements/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'NotFoundError');
    });

    test('PUT /api/announcements/:id updates full announcement and returns 200', async () => {
      const seedId = 'b2222222-2222-4222-a222-222222222222';
      const payload = {
        title: 'Updated Tech Career Fair Schedule',
        content: 'Now featuring over 100 enterprise tech exhibitors with on-site interviews.',
        category: 'career',
        author: 'Career Center',
        priority: 'urgent',
      };

      const res = await apiRequest('PUT', `/api/announcements/${seedId}`, payload);
      assert.strictEqual(res.statusCode, 200);

      const updated = res.json();
      assert.strictEqual(updated.id, seedId);
      assert.strictEqual(updated.title, payload.title);
      assert.strictEqual(updated.priority, 'urgent');

      // Verify persistence
      const getRes = await request(`/api/announcements/${seedId}`);
      assert.strictEqual(getRes.json().title, payload.title);
    });

    test('PUT /api/announcements/:id returns 404 for non-existent ID', async () => {
      const res = await apiRequest('PUT', '/api/announcements/99999999-9999-9999-9999-999999999999', {
        title: 'Ghost Announcement',
        content: 'Ghost details long enough',
        category: 'social',
        author: 'Ghost Author',
      });
      assert.strictEqual(res.statusCode, 404);
    });

    test('PATCH /api/announcements/:id partially updates announcement and returns 200', async () => {
      const seedId = 'c3333333-3333-4333-a333-333333333333';
      const res = await apiRequest('PATCH', `/api/announcements/${seedId}`, {
        priority: 'urgent',
      });

      assert.strictEqual(res.statusCode, 200);
      const item = res.json();
      assert.strictEqual(item.id, seedId);
      assert.strictEqual(item.priority, 'urgent');

      // Verify persistence
      const getRes = await request(`/api/announcements/${seedId}`);
      assert.strictEqual(getRes.json().priority, 'urgent');
    });

    test('PATCH /api/announcements/:id returns 404 for non-existent ID', async () => {
      const res = await apiRequest('PATCH', '/api/announcements/99999999-9999-9999-9999-999999999999', {
        priority: 'urgent',
      });
      assert.strictEqual(res.statusCode, 404);
    });

    test('DELETE /api/announcements/:id removes announcement and returns 200', async () => {
      const seedId = 'c3333333-3333-4333-a333-333333333333';
      const res = await apiRequest('DELETE', `/api/announcements/${seedId}`);
      assert.strictEqual(res.statusCode, 200);

      const data = res.json();
      assert.strictEqual(data.status, 'success');
      assert.strictEqual(data.id, seedId);

      // Verify subsequent GET returns 404
      const getRes = await request(`/api/announcements/${seedId}`);
      assert.strictEqual(getRes.statusCode, 404);
    });

    test('DELETE /api/announcements/:id returns 404 when deleting non-existent ID', async () => {
      const res = await apiRequest('DELETE', '/api/announcements/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
    });
  });

  // ==========================================
  // Week 4 Homework: Announcement View Layer (/announcements)
  // ==========================================
  describe('Week 4 Homework: Announcement View Layer (/announcements)', () => {
    beforeEach(async () => {
      await resetAnnouncements();
    });

    test('GET /announcements returns 200 with semantic HTML page and pre-hydrated bulletins', async () => {
      const res = await request('/announcements');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.match(res.body, /<title>Alumni Tracking System \| Announcements<\/title>/);
      assert.match(res.body, /Announcements &amp; Bulletins/);
      assert.match(res.body, /Annual Alumni Homecoming 2026/);
      assert.match(res.body, /<header>/);
      assert.match(res.body, /<main>/);
      assert.match(res.body, /<footer>/);
    });

    test('POST /announcements with urlencoded form submission creates announcement and redirects (302)', async () => {
      const formPayload = 'title=Campus+Hackathon+2026&content=Annual+48-hour+innovation+hackathon+with+cash+prizes.&category=academic&author=Hackathon+Club&priority=urgent';
      const res = await apiRequest('POST', '/announcements', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/announcements\?status=created/);

      // Verify announcement is persisted
      const listRes = await request('/api/announcements');
      const items = listRes.json();
      assert.ok(items.some((a) => a.title === 'Campus Hackathon 2026'));
    });

    test('POST /announcements with invalid form data redirects with error parameter (302)', async () => {
      const formPayload = 'title=Hi&content=Short&category=invalid&author=A';
      const res = await apiRequest('POST', '/announcements', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/announcements\?error=/);
    });

    test('GET /announcements/:id with HTML accept header redirects to view query (302)', async () => {
      const seedId = 'a1111111-1111-4111-a111-111111111111';
      const res = await request(`/announcements/${seedId}`, { Accept: 'text/html' });
      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, new RegExp(`/announcements\\?view=${seedId}`));
    });

    test('GET /announcements/:id with non-existent ID returns 404', async () => {
      const res = await request('/announcements/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
    });

    test('POST /announcements/:id/delete with form action deletes announcement and redirects (302)', async () => {
      const seedId = 'b2222222-2222-4222-a222-222222222222';
      const res = await apiRequest('POST', `/announcements/${seedId}/delete`, '', {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/announcements\?status=deleted/);

      // Verify announcement is deleted
      const checkRes = await request(`/api/announcements/${seedId}`);
      assert.strictEqual(checkRes.statusCode, 404);
    });
  });

  /* =========================================================================
   * WEEK 6: Job Postings & Nested Routing (/api/jobs, /api/users/:id/jobs)
   * ========================================================================= */
  describe('Week 6: Job Postings API & Nested Routing', () => {
    const seedUserId = '11111111-1111-4111-a111-111111111111'; // Ada Lovelace
    let createdJobId;

    before(async () => {
      await jobPostingFactory.seed();
    });

    test('POST /api/users/:id/jobs creates job posting strictly using param ID', async () => {
      const spoofedUserId = '22222222-2222-4222-a222-222222222222';
      const res = await apiRequest('POST', `/api/users/${seedUserId}/jobs`, {
        userId: spoofedUserId, // Should be ignored in favor of path param
        title: 'Staff Software Architect',
        company: 'Ada Research Labs',
        location: 'London, UK / Remote',
        description: 'Lead research in advanced computing paradigms.',
      });

      assert.strictEqual(res.statusCode, 201);
      const data = res.json();
      assert.strictEqual(data.title, 'Staff Software Architect');
      assert.strictEqual(data.company, 'Ada Research Labs');
      assert.strictEqual(data.userId, seedUserId); // Strict extraction from URL param
      assert.ok(data.id);
      createdJobId = data.id;
    });

    test('POST /api/users/:id/jobs returns 404 for non-existent user ID', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';
      const res = await apiRequest('POST', `/api/users/${nonExistentId}/jobs`, {
        title: 'Ghost Engineer',
        company: 'Phantom Corp',
      });

      assert.strictEqual(res.statusCode, 404);
    });

    test('POST /api/users/:id/jobs returns 400 for missing title or company', async () => {
      const res = await apiRequest('POST', `/api/users/${seedUserId}/jobs`, {
        title: '',
        company: 'Missing Title Inc.',
      });

      assert.strictEqual(res.statusCode, 400);
    });

    test('GET /api/users/:id/jobs returns list of jobs authored by user', async () => {
      const res = await request(`/api/users/${seedUserId}/jobs`);
      assert.strictEqual(res.statusCode, 200);
      const jobs = res.json();
      assert.ok(Array.isArray(jobs));
      assert.ok(jobs.some((j) => j.id === createdJobId && j.userId === seedUserId));
    });

    test('GET /api/jobs returns all job postings', async () => {
      const res = await request('/api/jobs');
      assert.strictEqual(res.statusCode, 200);
      const jobs = res.json();
      assert.ok(Array.isArray(jobs));
      assert.ok(jobs.some((j) => j.id === createdJobId));
    });

    test('GET /api/jobs/:id returns single job posting details', async () => {
      const res = await request(`/api/jobs/${createdJobId}`);
      assert.strictEqual(res.statusCode, 200);
      const job = res.json();
      assert.strictEqual(job.id, createdJobId);
      assert.strictEqual(job.title, 'Staff Software Architect');
    });

    test('PUT /api/jobs/:id updates job posting details', async () => {
      const res = await apiRequest('PUT', `/api/jobs/${createdJobId}`, {
        title: 'Principal Software Architect',
        company: 'Ada Research Labs',
        location: 'Oxford, UK',
      });

      assert.strictEqual(res.statusCode, 200);
      const job = res.json();
      assert.strictEqual(job.title, 'Principal Software Architect');
      assert.strictEqual(job.location, 'Oxford, UK');
    });

    test('GET /api/jobs/:id returns 404 for unknown ID', async () => {
      const res = await request('/api/jobs/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
    });
  });

  /* =========================================================================
   * WEEK 6: Applications, Direct/Nested Routing & 409 Conflict
   * ========================================================================= */
  describe('Week 6: Applications API, Nested Routing & 409 Conflict', () => {
    const authorUserId = '22222222-2222-4222-a222-222222222222'; // Alan Turing
    const candidateUserId = '44444444-4444-4444-a444-444444444444'; // Margaret Hamilton
    let jobId;
    let applicationId;

    before(async () => {
      // Create a test job posting for applications testing
      const jobRes = await apiRequest('POST', `/api/users/${authorUserId}/jobs`, {
        title: 'Apollo Systems Lead Engineer',
        company: 'NASA / MIT Instrumentation Lab',
        location: 'Cambridge, MA',
        description: 'Flight computer software development.',
      });
      assert.strictEqual(jobRes.statusCode, 201);
      jobId = jobRes.json().id;
    });

    test('POST /api/jobs/:id/applications creates an application successfully', async () => {
      const res = await apiRequest('POST', `/api/jobs/${jobId}/applications`, {
        userId: candidateUserId,
        status: 'applied',
      });

      assert.strictEqual(res.statusCode, 201);
      const app = res.json();
      assert.strictEqual(app.userId, candidateUserId);
      assert.strictEqual(app.jobPostingId, jobId);
      assert.strictEqual(app.status, 'applied');
      assert.ok(app.id);
      applicationId = app.id;
    });

    test('POST /api/jobs/:id/applications returns 409 Conflict on duplicate application', async () => {
      const res = await apiRequest('POST', `/api/jobs/${jobId}/applications`, {
        userId: candidateUserId, // Same candidate for same job
        status: 'applied',
      });

      assert.strictEqual(res.statusCode, 409);
      const errorData = res.json();
      assert.strictEqual(errorData.error, 'Conflict');
      assert.strictEqual(errorData.message, 'User has already applied for this job posting');
    });

    test('POST /api/jobs/:id/applications returns 404 for non-existent candidate user', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';
      const res = await apiRequest('POST', `/api/jobs/${jobId}/applications`, {
        userId: nonExistentId,
      });

      assert.strictEqual(res.statusCode, 404);
    });

    test('POST /api/jobs/:id/applications returns 404 for non-existent job posting', async () => {
      const nonExistentJobId = '99999999-9999-9999-9999-999999999999';
      const res = await apiRequest('POST', `/api/jobs/${nonExistentJobId}/applications`, {
        userId: candidateUserId,
      });

      assert.strictEqual(res.statusCode, 404);
    });

    test('GET /api/jobs/:id/applications lists all applications submitted for that job', async () => {
      const res = await request(`/api/jobs/${jobId}/applications`);
      assert.strictEqual(res.statusCode, 200);
      const apps = res.json();
      assert.ok(Array.isArray(apps));
      assert.ok(apps.some((a) => a.id === applicationId && a.userId === candidateUserId));
    });

    test('GET /api/users/:id/applications lists all applications submitted by candidate', async () => {
      const res = await request(`/api/users/${candidateUserId}/applications`);
      assert.strictEqual(res.statusCode, 200);
      const apps = res.json();
      assert.ok(Array.isArray(apps));
      assert.ok(apps.some((a) => a.id === applicationId && a.jobPostingId === jobId));
    });

    test('GET /api/applications returns all applications in the system', async () => {
      const res = await request('/api/applications');
      assert.strictEqual(res.statusCode, 200);
      const apps = res.json();
      assert.ok(Array.isArray(apps));
      assert.ok(apps.some((a) => a.id === applicationId));
    });

    test('DELETE /api/jobs/:id cascades and deletes all associated applications', async () => {
      // Delete the job posting
      const delJobRes = await apiRequest('DELETE', `/api/jobs/${jobId}`);
      assert.strictEqual(delJobRes.statusCode, 200);

      // Verify job is gone
      const checkJobRes = await request(`/api/jobs/${jobId}`);
      assert.strictEqual(checkJobRes.statusCode, 404);

      // Verify cascaded deletion of application
      const checkAppRes = await request(`/api/applications/${applicationId}`);
      assert.strictEqual(checkAppRes.statusCode, 404);
    });

    test('Seeded job postings from jobPostingFactory are linked to existing users', async () => {
      const res = await request('/api/jobs');
      assert.strictEqual(res.statusCode, 200);
      const jobs = res.json();
      assert.ok(Array.isArray(jobs));
      // At least the 4 seed jobs from factory
      assert.ok(jobs.length >= 4);

      const turingJobsRes = await request(`/api/users/${authorUserId}/jobs`);
      assert.strictEqual(turingJobsRes.statusCode, 200);
      const turingJobs = turingJobsRes.json();
      assert.ok(Array.isArray(turingJobs));
      assert.ok(turingJobs.some((j) => j.company === 'Turing Quantum Systems'));
    });

    test('DELETE /api/users/:id cascades and deletes user job postings and applications', async () => {
      // 1. Create a transient user
      const tempUserRes = await apiRequest('POST', '/api/users', {
        name: 'Cascade Test User',
        email: 'cascade.test@alumni.edu',
        role: 'alumni',
      });
      assert.strictEqual(tempUserRes.statusCode, 201);
      const tempUserId = tempUserRes.json().id;

      // 2. Post a job under this user
      const tempJobRes = await apiRequest('POST', `/api/users/${tempUserId}/jobs`, {
        title: 'Cascade Systems Engineer',
        company: 'Cascade Corp',
      });
      assert.strictEqual(tempJobRes.statusCode, 201);
      const tempJobId = tempJobRes.json().id;

      // 3. Create an application for this job by candidateUserId
      const tempAppRes = await apiRequest('POST', `/api/jobs/${tempJobId}/applications`, {
        userId: candidateUserId,
      });
      assert.strictEqual(tempAppRes.statusCode, 201);
      const tempAppId = tempAppRes.json().id;

      // 4. Delete the author user
      const delUserRes = await apiRequest('DELETE', `/api/users/${tempUserId}`);
      assert.strictEqual(delUserRes.statusCode, 200);

      // 5. Verify user is gone
      const checkUser = await request(`/api/users/${tempUserId}`);
      assert.strictEqual(checkUser.statusCode, 404);

      // 6. Verify job posting was cascade deleted
      const checkJob = await request(`/api/jobs/${tempJobId}`);
      assert.strictEqual(checkJob.statusCode, 404);

      // 7. Verify application was cascade deleted
      const checkApp = await request(`/api/applications/${tempAppId}`);
      assert.strictEqual(checkApp.statusCode, 404);
    });
  });

  /* =========================================================================
   * WEEK 6 HOMEWORK: Job Postings View Layer (/jobs)
   * ========================================================================= */
  describe('Week 6 Homework: Job Postings View Layer (/jobs)', () => {
    const seedUserId = '11111111-1111-4111-a111-111111111111';

    test('GET /jobs returns 200 with semantic HTML page and pre-hydrated jobs', async () => {
      const res = await request('/jobs');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/html/);
      assert.match(res.body, /Career Opportunities &amp; Job Postings|Career Opportunities/);
      assert.match(res.body, /id="initial-jobs-data"/);
      assert.match(res.body, /id="initial-users-data"/);
    });

    test('POST /jobs with urlencoded form submission creates job and redirects (302)', async () => {
      const formPayload = new URLSearchParams({
        userId: seedUserId,
        title: 'Form Submission Engineer',
        company: 'Form Dynamics Inc.',
        location: 'Berlin, DE',
        description: 'Created through semantic HTML form submission.',
      }).toString();

      const res = await apiRequest('POST', '/jobs', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/jobs\?status=created/);
    });

    test('POST /jobs with invalid form data redirects with error parameter (302)', async () => {
      const formPayload = new URLSearchParams({
        userId: seedUserId,
        title: '', // Missing title
        company: 'Form Dynamics Inc.',
      }).toString();

      const res = await apiRequest('POST', '/jobs', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/jobs\?error=/);
    });

    test('GET /jobs/:id with HTML accept header redirects to view query (302)', async () => {
      const jobsListRes = await request('/api/jobs');
      const jobs = jobsListRes.json();
      assert.ok(jobs.length > 0);
      const targetJobId = jobs[0].id;

      const res = await request(`/jobs/${targetJobId}`, {
        Accept: 'text/html',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, new RegExp(`/jobs\\?view=${targetJobId}`));
    });

    test('GET /jobs/:id with non-existent ID returns 404', async () => {
      const res = await request('/jobs/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
    });

    test('POST /jobs/:id/delete with form action deletes job and redirects (302)', async () => {
      // Create a transient job to delete
      const createRes = await apiRequest('POST', `/api/users/${seedUserId}/jobs`, {
        title: 'Delete Me Job',
        company: 'Ephemeral Co',
      });
      assert.strictEqual(createRes.statusCode, 201);
      const toDeleteId = createRes.json().id;

      const res = await apiRequest('POST', `/jobs/${toDeleteId}/delete`, '', {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/jobs\?status=deleted/);

      // Verify deletion
      const checkRes = await request(`/api/jobs/${toDeleteId}`);
      assert.strictEqual(checkRes.statusCode, 404);
    });
  });

  /* =========================================================================
   * WEEK 6 HOMEWORK: Applications View Layer (/applications)
   * ========================================================================= */
  describe('Week 6 Homework: Applications View Layer (/applications)', () => {
    const candidateUserId = '33333333-3333-4333-a333-333333333333'; // Grace Hopper
    let targetJobId;

    before(async () => {
      const jobsRes = await request('/api/jobs');
      const jobs = jobsRes.json();
      assert.ok(jobs.length > 0);
      targetJobId = jobs[0].id;
    });

    test('GET /applications returns 200 with semantic HTML page and pre-hydrated applications', async () => {
      const res = await request('/applications');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/html/);
      assert.match(res.body, /Candidate Applications &amp; Tracking|Candidate Applications/);
      assert.match(res.body, /id="initial-applications-data"/);
    });

    test('POST /applications with form submission creates application and redirects (302)', async () => {
      // Use candidate Grace Hopper on a job
      const formPayload = new URLSearchParams({
        userId: candidateUserId,
        jobId: targetJobId,
        status: 'applied',
      }).toString();

      const res = await apiRequest('POST', '/applications', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/applications\?status=created/);
    });

    test('POST /applications with duplicate submission redirects with Conflict error (302)', async () => {
      // Attempt duplicate application for same candidate & job
      const formPayload = new URLSearchParams({
        userId: candidateUserId,
        jobId: targetJobId,
      }).toString();

      const res = await apiRequest('POST', '/applications', formPayload, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/applications\?error=/);
      assert.match(decodeURIComponent(res.headers.location), /already applied/i);
    });

    test('GET /applications/:id with HTML accept header redirects to view query (302)', async () => {
      const appsListRes = await request('/api/applications');
      const apps = appsListRes.json();
      assert.ok(apps.length > 0);
      const targetAppId = apps[0].id;

      const res = await request(`/applications/${targetAppId}`, {
        Accept: 'text/html',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, new RegExp(`/applications\\?view=${targetAppId}`));
    });

    test('GET /applications/:id with non-existent ID returns 404', async () => {
      const res = await request('/applications/99999999-9999-9999-9999-999999999999');
      assert.strictEqual(res.statusCode, 404);
    });

    test('POST /applications/:id/delete with form action deletes application and redirects (302)', async () => {
      // Find an existing application to delete
      const appsListRes = await request('/api/applications');
      const apps = appsListRes.json();
      const appToDelete = apps.find(a => a.userId === candidateUserId && a.jobPostingId === targetJobId);
      assert.ok(appToDelete);

      const res = await apiRequest('POST', `/applications/${appToDelete.id}/delete`, '', {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      assert.strictEqual(res.statusCode, 302);
      assert.match(res.headers.location, /\/applications\?status=deleted/);

      // Verify deletion
      const checkRes = await request(`/api/applications/${appToDelete.id}`);
      assert.strictEqual(checkRes.statusCode, 404);
    });
  });

  /* =========================================================================
   * TASKS 1 & 2: Input Validation & Job Posting Rules
   * ========================================================================= */
  describe('Tasks 1 & 2: Input Validation & Job Posting Rules', () => {
    const validUserId = '11111111-1111-4111-a111-111111111111'; // Ada Lovelace
    let createdJobId;

    test('POST /api/jobs returns 400 Bad Request when "title" is missing', async () => {
      const res = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        company: 'Stripe',
      });

      assert.strictEqual(res.statusCode, 400);
      const data = res.json();
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(Array.isArray(data.details));
      assert.ok(data.details.some((d) => d.includes('title')));
    });

    test('POST /api/jobs returns 400 Bad Request when "title" is an empty string or whitespace', async () => {
      const res = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: '   ',
        company: 'Stripe',
      });

      assert.strictEqual(res.statusCode, 400);
      const data = res.json();
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(data.details.some((d) => d.includes('empty')));
    });

    test('POST /api/jobs returns 400 Bad Request when "title" is not a string (type mismatch)', async () => {
      const res = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: 12345,
        company: 'Stripe',
      });

      assert.strictEqual(res.statusCode, 400);
      const data = res.json();
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(data.details.some((d) => d.includes('must be a string')));
    });

    test('POST /api/jobs returns 400 Bad Request when "title" exceeds 120 characters', async () => {
      const longTitle = 'A'.repeat(121);
      const res = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: longTitle,
        company: 'Stripe',
      });

      assert.strictEqual(res.statusCode, 400);
      const data = res.json();
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(data.details.some((d) => d.includes('120 characters')));
    });

    test('POST /api/jobs succeeds when "title" is exactly 120 characters', async () => {
      const title120 = 'Engineering Lead - '.padEnd(120, 'X');
      const res = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: title120,
        company: 'Stripe Global',
        city: 'San Francisco',
        description: 'Lead engineering operations.',
      });

      assert.strictEqual(res.statusCode, 201);
      const data = res.json();
      assert.strictEqual(data.title.length, 120);
      assert.strictEqual(data.company, 'Stripe Global');
      assert.strictEqual(data.city, 'San Francisco');
      createdJobId = data.id;
    });

    test('POST /api/jobs returns 400 Bad Request when "company" is missing', async () => {
      const res = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: 'Backend Engineer',
      });

      assert.strictEqual(res.statusCode, 400);
      const data = res.json();
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(data.details.some((d) => d.includes('company')));
    });

    test('POST /api/jobs returns 400 Bad Request when "company" is an empty string or whitespace', async () => {
      const res = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: 'Backend Engineer',
        company: '   ',
      });

      assert.strictEqual(res.statusCode, 400);
      const data = res.json();
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(data.details.some((d) => d.includes('empty')));
    });

    test('POST /api/jobs returns 400 Bad Request when "company" is not a string', async () => {
      const res = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: 'Backend Engineer',
        company: true,
      });

      assert.strictEqual(res.statusCode, 400);
      const data = res.json();
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(data.details.some((d) => d.includes('company') && d.includes('must be a string')));
    });

    test('POST /api/jobs handles optional "city" correctly (valid string vs invalid type)', async () => {
      // Non-string city should fail with 400
      const invalidRes = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: 'Cloud Architect',
        company: 'Google Cloud',
        city: 99999,
      });
      assert.strictEqual(invalidRes.statusCode, 400);
      const invalidData = invalidRes.json();
      assert.ok(invalidData.details.some((d) => d.includes('city') && d.includes('must be a string')));

      // Valid string city should succeed
      const validRes = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: 'Cloud Architect',
        company: 'Google Cloud',
        city: 'Zurich, Switzerland',
      });
      assert.strictEqual(validRes.statusCode, 201);
      assert.strictEqual(validRes.json().city, 'Zurich, Switzerland');
    });

    test('POST /api/jobs handles optional "description" correctly (valid string vs invalid type)', async () => {
      // Non-string description should fail with 400
      const invalidRes = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: 'Staff Engineer',
        company: 'Meta',
        description: { invalid: 'object' },
      });
      assert.strictEqual(invalidRes.statusCode, 400);
      const invalidData = invalidRes.json();
      assert.ok(invalidData.details.some((d) => d.includes('description') && d.includes('must be a string')));

      // Valid string description should succeed
      const validRes = await apiRequest('POST', '/api/jobs', {
        userId: validUserId,
        title: 'Staff Engineer',
        company: 'Meta',
        description: 'Distributed cache systems and compilers.',
      });
      assert.strictEqual(validRes.statusCode, 201);
      assert.strictEqual(validRes.json().description, 'Distributed cache systems and compilers.');
    });

    test('POST /api/jobs gracefully handles empty JSON body ({}) with 400 instead of 500', async () => {
      const res = await apiRequest('POST', '/api/jobs', {});
      assert.strictEqual(res.statusCode, 400);
      const data = res.json();
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(Array.isArray(data.details));
      assert.ok(data.details.length >= 2);
    });

    test('POST /api/jobs gracefully handles malformed JSON body without crashing', async () => {
      const malformedPayload = '{"title": "Broken JSON';
      const res = await apiRequest('POST', '/api/jobs', malformedPayload, {
        'Content-Type': 'application/json',
      });

      assert.strictEqual(res.statusCode, 400);
      const data = res.json();
      assert.strictEqual(data.error, 'Validation failed');
    });

    test('PUT /api/jobs/:id enforces identical validation rules for updates', async () => {
      assert.ok(createdJobId, 'Precondition: createdJobId must exist');

      // 1. Missing title on update
      const resMissingTitle = await apiRequest('PUT', `/api/jobs/${createdJobId}`, {
        company: 'Updated Corp',
      });
      assert.strictEqual(resMissingTitle.statusCode, 400);
      assert.strictEqual(resMissingTitle.json().error, 'Validation failed');

      // 2. Title exceeds 120 characters on update
      const resOver120 = await apiRequest('PUT', `/api/jobs/${createdJobId}`, {
        title: 'Z'.repeat(125),
        company: 'Updated Corp',
      });
      assert.strictEqual(resOver120.statusCode, 400);

      // 3. Invalid city type on update
      const resInvalidCity = await apiRequest('PUT', `/api/jobs/${createdJobId}`, {
        title: 'Updated Title',
        company: 'Updated Corp',
        city: false,
      });
      assert.strictEqual(resInvalidCity.statusCode, 400);

      // 4. Valid update succeeds
      const resValidUpdate = await apiRequest('PUT', `/api/jobs/${createdJobId}`, {
        title: 'Principal Lead Engineer',
        company: 'Updated Corp',
        city: 'New York, NY',
        description: 'New role scope.',
      });
      assert.strictEqual(resValidUpdate.statusCode, 200);
      const updated = resValidUpdate.json();
      assert.strictEqual(updated.title, 'Principal Lead Engineer');
      assert.strictEqual(updated.city, 'New York, NY');
    });
  });

  /* =========================================================================
   * TASK 3: Custom Logger Middleware
   * ========================================================================= */
  describe('Task 3: Custom Logger Middleware', () => {
    const { getLocalTimeString, requestLogger } = require('../src/middlewares/requestLogger.middleware');

    test('getLocalTimeString returns HH:MM:SS format in 24-hour time', () => {
      const testDate = new Date(2026, 10, 11, 9, 5, 7);
      const formatted = getLocalTimeString(testDate);
      assert.match(formatted, /^\d{2}:\d{2}:\d{2}$/);
      assert.strictEqual(formatted, '09:05:07');
    });

    test('requestLogger measures execution duration from intake to finish and logs structure', (t, done) => {
      const originalLog = console.log;
      let capturedLog = null;

      console.log = (msg) => {
        capturedLog = msg;
      };

      const mockReq = {
        method: 'POST',
        originalUrl: '/jobs',
      };

      const finishCallbacks = [];
      const mockRes = {
        statusCode: 201,
        on: (event, cb) => {
          if (event === 'finish') finishCallbacks.push(cb);
        },
      };

      requestLogger(mockReq, mockRes, () => {
        // Trigger finish callback
        finishCallbacks.forEach((cb) => cb());

        console.log = originalLog;

        assert.ok(capturedLog, 'Logger should have emitted a log line');
        // Validate exact structure: <time> <method> <route> <restype> <duration>
        // Example: 10:20:32 POST /jobs 201 18ms
        const match = capturedLog.match(/^(\d{2}:\d{2}:\d{2})\s+([A-Z]+)\s+(\S+)\s+(\d{3})\s+(\d+ms)$/);
        assert.ok(match, `Log line did not match expected structure: "${capturedLog}"`);
        assert.strictEqual(match[2], 'POST');
        assert.strictEqual(match[3], '/jobs');
        assert.strictEqual(match[4], '201');
        assert.match(match[5], /^\d+ms$/);
        done();
      });
    });

    test('Custom logger captures real HTTP requests across top of pipeline', async () => {
      const originalLog = console.log;
      const logs = [];

      console.log = (msg) => {
        logs.push(msg);
      };

      try {
        await request('/health');
        await request('/css/style.css');
        await apiRequest('GET', '/api/health');
      } finally {
        console.log = originalLog;
      }

      // Verify that all 3 requests were captured by the top-mounted middleware
      assert.ok(logs.some((l) => l.includes('GET /health 200')));
      assert.ok(logs.some((l) => l.includes('GET /css/style.css 200')));
      assert.ok(logs.some((l) => l.includes('GET /api/health 200')));

      // Check log formatting on every captured line
      for (const logLine of logs) {
        assert.match(logLine, /^\d{2}:\d{2}:\d{2}\s+[A-Z]+\s+\S+\s+\d{3}\s+\d+ms$/);
      }
    });
  });

  /* =========================================================================
   * TASK 4: 404 Guardian Middleware
   * ========================================================================= */
  describe('Task 4: 404 Guardian Middleware', () => {
    test('Unmapped /api/* route returns 404 with exact structured JSON and reason', async () => {
      const res = await apiRequest('GET', '/api/nonexistent-service');
      assert.strictEqual(res.statusCode, 404);
      assert.match(res.headers['content-type'], /application\/json/);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Not Found');
      assert.strictEqual(
        data.reason,
        "The requested resource or endpoint 'GET /api/nonexistent-service' does not exist on this server."
      );
      assert.strictEqual(data.path, '/api/nonexistent-service');
      assert.strictEqual(data.method, 'GET');
    });

    test('POST to unmapped route returns 404 with method and path in reason', async () => {
      const res = await apiRequest('POST', '/api/v2/jobs/invalid', { test: true });
      assert.strictEqual(res.statusCode, 404);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Not Found');
      assert.strictEqual(
        data.reason,
        "The requested resource or endpoint 'POST /api/v2/jobs/invalid' does not exist on this server."
      );
      assert.strictEqual(data.method, 'POST');
      assert.strictEqual(data.path, '/api/v2/jobs/invalid');
    });

    test('Browser HTML request returns 404 formatted HTML view with explicit reason', async () => {
      const res = await request('/missing-page', { Accept: 'text/html' });
      assert.strictEqual(res.statusCode, 404);
      assert.match(res.headers['content-type'], /text\/html/);
      assert.match(res.body, /<h1[^>]*>404<\/h1>/);
      assert.match(res.body, /Route Not Found/);
      assert.match(
        res.body,
        /The requested resource or endpoint 'GET \/missing-page' does not exist on this server\./
      );
    });

    test('Unit test notFoundGuardian middleware with mock JSON and HTML flows', () => {
      const notFoundGuardian = require('../src/middlewares/notFoundGuardian.middleware');

      let jsonPayload = null;
      let statusCode = null;
      const mockJsonRes = {
        status: (code) => {
          statusCode = code;
          return {
            json: (payload) => {
              jsonPayload = payload;
              return payload;
            },
          };
        },
      };

      notFoundGuardian(
        { method: 'DELETE', originalUrl: '/api/unknown', xhr: true },
        mockJsonRes,
        () => {}
      );

      assert.strictEqual(statusCode, 404);
      assert.strictEqual(jsonPayload.status, 'error');
      assert.strictEqual(jsonPayload.error, 'Not Found');
      assert.strictEqual(
        jsonPayload.reason,
        "The requested resource or endpoint 'DELETE /api/unknown' does not exist on this server."
      );
      assert.strictEqual(jsonPayload.method, 'DELETE');
      assert.strictEqual(jsonPayload.path, '/api/unknown');
    });
  });

  /* =========================================================================
   * TASK 5: 5xx Guardian Middleware (Global Error Handler)
   * ========================================================================= */
  describe('Task 5: 5xx Guardian Middleware (Global Error Handler)', () => {
    const errorGuardian = require('../src/middlewares/errorGuardian.middleware');

    test('errorGuardian middleware function has exactly 4 parameters (err, req, res, next)', () => {
      assert.strictEqual(typeof errorGuardian, 'function');
      assert.strictEqual(errorGuardian.length, 4, 'Express requires error middleware to declare exactly 4 arguments');
    });

    test('Unhandled error in API route triggers 5xx Guardian with standardized JSON payload', async () => {
      const res = await apiRequest('GET', '/api/error-test');
      assert.strictEqual(res.statusCode, 500);
      assert.match(res.headers['content-type'], /application\/json/);

      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Internal Server Error');
      assert.strictEqual(data.message, 'A server-side error occurred while processing your request.');
      assert.strictEqual(data.reason, 'Simulated runtime server crash');
      assert.strictEqual(data.path, '/api/error-test');
      assert.strictEqual(data.method, 'GET');
      // Stack trace should be present in non-production
      assert.strictEqual(typeof data.stack, 'string');
    });

    test('Unhandled error with custom 5xx status code (e.g. 503) respects statusCode', async () => {
      const res = await apiRequest('GET', '/api/error-test?status=503&message=Database+cluster+unreachable');
      assert.strictEqual(res.statusCode, 503);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Internal Server Error');
      assert.strictEqual(data.reason, 'Database cluster unreachable');
    });

    test('Browser HTML request encountering 5xx returns formatted HTML error page', async () => {
      const res = await request('/error-test?message=View+rendering+fault', { Accept: 'text/html' });
      assert.strictEqual(res.statusCode, 500);
      assert.match(res.headers['content-type'], /text\/html/);
      assert.match(res.body, /<h1[^>]*>Error 500<\/h1>/);
      assert.match(res.body, /Internal Server Error/);
      assert.match(res.body, /A server-side error occurred while processing your request\./);
      assert.match(res.body, /View rendering fault/);
    });

    test('errorGuardian logs timestamped error details to console.error', () => {
      const originalConsoleError = console.error;
      let loggedOutput = null;

      console.error = (...args) => {
        loggedOutput = args.join(' ');
      };

      try {
        const mockReq = { method: 'POST', originalUrl: '/api/test-crash' };
        const mockRes = {
          status: () => ({ json: () => {} }),
          setHeader: () => {},
        };
        const sampleErr = new Error('Fatal database disconnection');

        errorGuardian(sampleErr, mockReq, mockRes, () => {});

        assert.ok(loggedOutput, 'console.error should have been called');
        assert.match(loggedOutput, /5xx Server Error \[500\] on POST \/api\/test-crash/);
        assert.match(loggedOutput, /Fatal database disconnection/);
      } finally {
        console.error = originalConsoleError;
      }
    });

    test('errorGuardian hides stack trace when NODE_ENV is "production"', () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      let jsonResult = null;
      const mockReq = { method: 'GET', originalUrl: '/api/secure-fail' };
      const mockRes = {
        status: (code) => {
          assert.strictEqual(code, 500);
          return {
            json: (payload) => {
              jsonResult = payload;
              return payload;
            },
          };
        },
      };

      const originalConsoleError = console.error;
      console.error = () => {};

      try {
        const errorWithStack = new Error('Secret system failure');
        errorGuardian(errorWithStack, mockReq, mockRes, () => {});

        assert.ok(jsonResult);
        assert.strictEqual(jsonResult.reason, 'Secret system failure');
        assert.strictEqual(jsonResult.stack, undefined, 'Stack trace must be hidden in production');
      } finally {
        process.env.NODE_ENV = prevEnv;
        console.error = originalConsoleError;
      }
    });

    test('Server remains operational after catching a 5xx error without crashing', async () => {
      // 1. Trigger a 500 error
      const crashRes = await apiRequest('GET', '/api/error-test');
      assert.strictEqual(crashRes.statusCode, 500);

      // 2. Immediately issue subsequent valid request to verify process is healthy and responsive
      const healthRes = await request('/health');
      assert.strictEqual(healthRes.statusCode, 200);
      assert.strictEqual(healthRes.json().status, 'ok');
    });
  });

  /* =========================================================================
   * TASK 6: File-Based Persistent Error Logging
   * ========================================================================= */
  describe('Task 6: File-Based Persistent Error Logging', () => {
    const fs = require('fs');
    const {
      appendErrorLog,
      formatErrorEntry,
      readErrorLog,
      clearErrorLog,
      getErrorLogPath,
      getLogsDir,
    } = require('../src/utils/fileLogger');

    beforeEach(async () => {
      await clearErrorLog();
    });

    test('logs directory is dynamically created at startup', () => {
      const logsDir = getLogsDir();
      assert.ok(fs.existsSync(logsDir), `Logs directory "${logsDir}" should exist`);
    });

    test('formatErrorEntry formats log entry with exact required structure', () => {
      const testErr = new Error('Database pool exhaustion');
      testErr.stack = 'Error: Database pool exhaustion\n    at query (/src/db.js:12:3)';

      const entry = formatErrorEntry({
        method: 'POST',
        route: '/api/jobs',
        statusCode: 500,
        err: testErr,
        timestamp: '2026-11-11T10:00:00.000Z',
      });

      // Structure: [<ISO-Timestamp / HH:MM:SS>] [<METHOD>] [<ROUTE>] [<STATUS_CODE>] Error: <message> | Stack: <stack trace>
      assert.match(
        entry,
        /^\[2026-11-11T10:00:00\.000Z\]\s+\[POST\]\s+\[\/api\/jobs\]\s+\[500\]\s+Error:\s+Database pool exhaustion\s+\|\s+Stack:\s+Error:\s+Database pool exhaustion -> at query/
      );
    });

    test('Simulated 500 error in API triggers append to logs/error.log', async () => {
      // 1. Trigger simulated 500 error via HTTP
      const uniqueMsg = `Simulated crash token ${Date.now()}`;
      const res = await apiRequest('GET', `/api/error-test?message=${encodeURIComponent(uniqueMsg)}`);
      assert.strictEqual(res.statusCode, 500);

      // Wait brief moment for non-blocking file write to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 2. Read log contents
      const logContent = await readErrorLog();
      assert.ok(logContent.length > 0, 'error.log should not be empty');
      assert.ok(logContent.includes('[GET]'), 'Log entry should include HTTP method');
      assert.ok(logContent.includes('[500]'), 'Log entry should include status code 500');
      assert.ok(logContent.includes('/api/error-test'), 'Log entry should include route path');
      assert.ok(logContent.includes(uniqueMsg), 'Log entry should include unique error message');
      assert.ok(logContent.includes('Stack:'), 'Log entry should include stack section');
    });

    test('404 guardian catch appends 404 entry to logs/error.log', async () => {
      const uniquePath = `/non-existent-guard-test-${Date.now()}`;
      const res = await apiRequest('GET', uniquePath);
      assert.strictEqual(res.statusCode, 404);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const logContent = await readErrorLog();
      assert.ok(logContent.includes('[404]'), 'Log entry should include status code 404');
      assert.ok(logContent.includes(uniquePath), 'Log entry should include the unmapped route');
      assert.ok(logContent.includes('Error:'), 'Log entry should record error details');
    });

    test('appendErrorLog gracefully catches file system errors without crashing', async () => {
      const originalAppendFile = fs.promises.appendFile;
      const originalConsoleError = console.error;
      console.error = () => {};

      try {
        // Mock write failure (e.g. disk full or EACCES permission denied)
        fs.promises.appendFile = async () => {
          throw new Error('EACCES: permission denied, open logs/error.log');
        };

        const result = await appendErrorLog({
          method: 'GET',
          route: '/fail',
          statusCode: 500,
          err: new Error('Simulated failure during disk crash'),
        });

        // Must return null and NOT throw or crash
        assert.strictEqual(result, null);
      } finally {
        fs.promises.appendFile = originalAppendFile;
        console.error = originalConsoleError;
      }
    });
  });

  /* =========================================================================
   * TASK 7: Generic 404 Page & Invalid Request Redirection
   * ========================================================================= */
  describe('Task 7: Generic 404 Page & Invalid Request Redirection', () => {
    test('Browser/HTML requests to unknown route return 404 and rendered 404 HTML page', async () => {
      const res = await request('/unknown-web-page-test', {
        Accept: 'text/html',
      });

      assert.strictEqual(res.statusCode, 404);
      assert.match(res.headers['content-type'], /text\/html/);
      assert.match(res.body, /<title>Page Not Found \(404\) \| Alumni System<\/title>/);
      assert.match(res.body, /Page Not Found \(404\) &bull; Route Not Found/);
      assert.match(res.body, /Go Back to Home/);
      assert.match(res.body, /Browse Jobs/);
      assert.match(res.body, /meta http-equiv="refresh" content="5; url=\/jobs"/);
      assert.match(res.body, /countdown-seconds/);
      assert.match(res.body, /The requested resource or endpoint 'GET \/unknown-web-page-test' does not exist on this server\./);
    });

    test('Static 404 page is directly accessible via static middleware at /404.html', async () => {
      const res = await request('/404.html');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/html/);
      assert.match(res.body, /Page Not Found \(404\)/);
      assert.match(res.body, /Browse Jobs/);
    });

    test('API requests to /api/unknown strictly preserve REST semantics and return 404 JSON', async () => {
      const res = await apiRequest('GET', '/api/unknown');
      assert.strictEqual(res.statusCode, 404);
      assert.match(res.headers['content-type'], /application\/json/);

      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Not Found');
      assert.strictEqual(
        data.reason,
        "The requested resource or endpoint 'GET /api/unknown' does not exist on this server."
      );
      assert.strictEqual(data.path, '/api/unknown');
      assert.strictEqual(data.method, 'GET');
      // Ensure it is JSON and does NOT return HTML
      assert.ok(!res.body.includes('<!DOCTYPE html>'));
    });

    test('Requests with X-Requested-With / req.xhr or Accept: application/json receive JSON 404', async () => {
      const res = await request('/unmapped-client-path', {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      });

      assert.strictEqual(res.statusCode, 404);
      assert.match(res.headers['content-type'], /application\/json/);
      const data = res.json();
      assert.strictEqual(data.status, 'error');
      assert.strictEqual(data.error, 'Not Found');
      assert.strictEqual(data.path, '/unmapped-client-path');
    });
  });
});

