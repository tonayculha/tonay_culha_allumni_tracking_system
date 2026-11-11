const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Alumni Tracking System API',
    version: '1.0.0',
    description: `
**Clean-room Modular Backend for Alumni Tracking System**

This API is developed following clean architecture, layered separation of concerns, and MVC principles.
- **Week 3 Milestone**: In-Memory User Management CRUD & Interactive Swagger UI.
- **Week 4 Milestone**: MVC Architectural Refactoring with In-Memory UserModel, Dual Controllers (\`ApiUserController\` for \`/api/users\` JSON REST vs \`UserController\` for \`/users\` semantic HTML view), and Interactive Browser-based CRUD Portal.
- All User CRUD operations use a dedicated in-memory data store with thread-safe defensive cloning and pre-populated seed data, strictly without database connection per instructor specifications.
    `,
    contact: {
      name: 'Alumni Core Engineering Team',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Root base path (default)',
    },
    {
      url: '/api',
      description: 'API base path (v1)',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'System health, uptime diagnostics, and status checks',
    },
    {
      name: 'Users API (REST)',
      description: 'RESTful JSON CRUD endpoints for programmatic clients (/api/users)',
    },
    {
      name: 'Users View (MVC)',
      description: 'Semantic HTML5 MVC View layer & interactive management portal (/users)',
    },
    {
      name: 'Announcements API (REST)',
      description: 'RESTful JSON CRUD endpoints for Announcements (/api/announcements)',
    },
    {
      name: 'Announcements View (MVC)',
      description: 'Semantic HTML5 MVC View layer & interactive announcements management portal (/announcements)',
    },
    {
      name: 'Jobs API (REST)',
      description: 'RESTful JSON CRUD endpoints for Job Postings (/api/jobs, /api/users/:id/jobs)',
    },
    {
      name: 'Applications API (REST)',
      description: 'RESTful JSON CRUD endpoints for Applications (/api/applications, /api/jobs/:id/applications, /api/users/:id/applications)',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique system identifier (UUID)',
            example: '11111111-1111-4111-a111-111111111111',
          },
          name: {
            type: 'string',
            description: 'Full name of the user',
            example: 'Ada Lovelace',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Unique contact email',
            example: 'ada.lovelace@alumni.edu',
          },
          role: {
            type: 'string',
            description: 'Assigned platform role',
            example: 'admin',
            enum: ['admin', 'alumni', 'student'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Record creation timestamp (ISO 8601)',
            example: '2024-01-15T08:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Record last updated timestamp (ISO 8601)',
            example: '2024-01-15T08:00:00.000Z',
          },
        },
        required: ['id', 'name', 'email', 'role', 'createdAt'],
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'email', 'role'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            description: 'Full name of user',
            example: 'Charles Babbage',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Valid unique email',
            example: 'charles.babbage@alumni.edu',
          },
          role: {
            type: 'string',
            description: 'Role: admin, alumni, student',
            example: 'alumni',
          },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            description: 'Updated name of user',
            example: 'Charles Babbage Sr.',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Updated email',
            example: 'charles.senior@alumni.edu',
          },
          role: {
            type: 'string',
            description: 'Updated role',
            example: 'alumni',
          },
        },
      },
      Announcement: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique system identifier (UUID)',
            example: 'a1111111-1111-4111-a111-111111111111',
          },
          title: {
            type: 'string',
            description: 'Headline title of announcement',
            example: 'Annual Alumni Homecoming 2026',
          },
          content: {
            type: 'string',
            description: 'Full textual content',
            example: 'Join us for the Annual Alumni Homecoming Gala on campus.',
          },
          category: {
            type: 'string',
            enum: ['academic', 'career', 'social'],
            description: 'Topic category',
            example: 'social',
          },
          author: {
            type: 'string',
            description: 'Issuing department or organizer',
            example: 'Alumni Relations Office',
          },
          priority: {
            type: 'string',
            enum: ['low', 'normal', 'urgent'],
            description: 'Urgency level',
            example: 'urgent',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-01T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-01T10:00:00.000Z',
          },
        },
        required: ['id', 'title', 'content', 'category', 'author', 'priority', 'createdAt'],
      },
      CreateAnnouncementInput: {
        type: 'object',
        required: ['title', 'content', 'category', 'author'],
        properties: {
          title: {
            type: 'string',
            minLength: 3,
            description: 'Headline title',
            example: 'Annual Alumni Homecoming 2026',
          },
          content: {
            type: 'string',
            minLength: 5,
            description: 'Full textual content',
            example: 'Join us for the Annual Alumni Homecoming Gala on campus.',
          },
          category: {
            type: 'string',
            enum: ['academic', 'career', 'social'],
            example: 'social',
          },
          author: {
            type: 'string',
            minLength: 2,
            example: 'Alumni Relations Office',
          },
          priority: {
            type: 'string',
            enum: ['low', 'normal', 'urgent'],
            default: 'normal',
            example: 'normal',
          },
        },
      },
      UpdateAnnouncementInput: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 3,
            example: 'Updated Homecoming Date & Schedule',
          },
          content: {
            type: 'string',
            minLength: 5,
            example: 'Updated details for the gala.',
          },
          category: {
            type: 'string',
            enum: ['academic', 'career', 'social'],
            example: 'social',
          },
          author: {
            type: 'string',
            minLength: 2,
            example: 'Alumni Relations Office',
          },
          priority: {
            type: 'string',
            enum: ['low', 'normal', 'urgent'],
            example: 'urgent',
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'ok',
          },
          service: {
            type: 'string',
            example: 'Alumni Tracking System',
          },
          environment: {
            type: 'string',
            example: 'development',
          },
          uptime: {
            type: 'number',
            description: 'Uptime in seconds',
            example: 42,
          },
          uptimeHuman: {
            type: 'string',
            example: '42s',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2026-10-01T01:00:00.000Z',
          },
          system: {
            type: 'object',
            properties: {
              platform: { type: 'string', example: 'darwin' },
              nodeVersion: { type: 'string', example: 'v20.12.0' },
              memoryUsageMB: { type: 'number', example: 45 },
            },
          },
          database: {
            type: 'object',
            properties: {
              connected: { type: 'boolean', example: false },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          error: {
            type: 'string',
            example: 'ValidationError',
          },
          message: {
            type: 'string',
            example: 'Validation failed for user payload',
          },
          details: {
            type: 'array',
            items: { type: 'string' },
            example: ['Field "email" is required and must be a valid email address.'],
          },
        },
      },
      JobPosting: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '55555555-5555-4555-a555-555555555555',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            example: '11111111-1111-4111-a111-111111111111',
          },
          title: {
            type: 'string',
            example: 'Senior Backend Engineer',
          },
          company: {
            type: 'string',
            example: 'Google DeepMind',
          },
          location: {
            type: 'string',
            example: 'London, UK / Hybrid',
          },
          description: {
            type: 'string',
            example: 'Designing scalable microservices with PostgreSQL and Node.js.',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-10-22T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-10-22T10:00:00.000Z',
          },
        },
        required: ['id', 'userId', 'title', 'company', 'createdAt'],
      },
      CreateJobPostingInput: {
        type: 'object',
        required: ['title', 'company'],
        properties: {
          userId: {
            type: 'string',
            format: 'uuid',
            example: '11111111-1111-4111-a111-111111111111',
            description: 'Required for direct POST /api/jobs (ignored in nested /users/:id/jobs)',
          },
          title: {
            type: 'string',
            maxLength: 120,
            example: 'Senior Backend Engineer',
          },
          company: {
            type: 'string',
            example: 'Google DeepMind',
          },
          city: {
            type: 'string',
            example: 'London',
          },
          location: {
            type: 'string',
            example: 'London, UK / Hybrid',
          },
          description: {
            type: 'string',
            example: 'Designing scalable distributed systems.',
          },
        },
      },
      UpdateJobPostingInput: {
        type: 'object',
        required: ['title', 'company'],
        properties: {
          title: {
            type: 'string',
            maxLength: 120,
            example: 'Staff Backend Engineer',
          },
          company: {
            type: 'string',
            example: 'Google DeepMind',
          },
          city: {
            type: 'string',
            example: 'London',
          },
          location: {
            type: 'string',
            example: 'London, UK / Remote',
          },
          description: {
            type: 'string',
            example: 'Lead backend architecture.',
          },
        },
      },
      Application: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '66666666-6666-4666-a666-666666666666',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            example: '44444444-4444-4444-a444-444444444444',
          },
          jobPostingId: {
            type: 'string',
            format: 'uuid',
            example: '55555555-5555-4555-a555-555555555555',
          },
          status: {
            type: 'string',
            enum: ['applied', 'interview', 'accepted', 'rejected'],
            example: 'applied',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-10-22T10:30:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-10-22T10:30:00.000Z',
          },
        },
        required: ['id', 'userId', 'jobPostingId', 'status', 'createdAt'],
      },
      CreateApplicationInput: {
        type: 'object',
        required: ['userId', 'jobId'],
        properties: {
          userId: {
            type: 'string',
            format: 'uuid',
            example: '44444444-4444-4444-a444-444444444444',
          },
          jobId: {
            type: 'string',
            format: 'uuid',
            example: '55555555-5555-4555-a555-555555555555',
          },
          status: {
            type: 'string',
            enum: ['applied', 'interview', 'accepted', 'rejected'],
            default: 'applied',
          },
        },
      },
      ConflictErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Conflict',
          },
          message: {
            type: 'string',
            example: 'User has already applied for this job posting',
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [
    path.resolve(__dirname, '../routes/*.js'),
    path.resolve(__dirname, '../routes/**/*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
