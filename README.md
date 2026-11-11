# Alumni Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B%20LTS-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.19-lightgrey.svg)](https://expressjs.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D.svg)](https://swagger.io/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2%2B-blue.svg)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16--alpine-336791.svg)](https://www.postgresql.org/)

An enterprise-ready, clean-room implementation of the **Alumni Tracking System** coursework project. Built from first principles with a modular layered architecture, OpenAPI 3.0 Swagger interactive documentation, thread-safe in-memory user CRUD operations, parametric routing, strict validation, and containerized zero-touch deployment.

---

## 📖 Table of Contents

- [Project Philosophy](#-project-philosophy)
- [MVC Architecture Specification](#-mvc-architecture-specification)
- [Architecture & Layering](#-architecture--layering)
- [Directory Structure](#-directory-structure)
- [Quick Start: The One-Command Rule](#-quick-start-the-one-command-rule)
- [Swagger & Interactive API Documentation](#-swagger--interactive-api-documentation)
- [API Reference & Contract](#-api-reference--contract)
  - [1. Health Check (`GET /api/health`)](#1-health-check)
  - [2. In-Memory User CRUD (`/api/users`)](#2-in-memory-user-management-crud)
  - [3. Interactive MVC Users Portal (`GET /users`)](#3-interactive-mvc-users-portal)
  - [4. In-Memory Announcement CRUD (`/api/announcements`)](#4-in-memory-announcement-management-crud)
  - [5. Interactive MVC Announcements Portal (`GET /announcements`)](#5-interactive-mvc-announcements-portal)
  - [6. Parametric Greeting (`GET /hello/:name`)](#6-parametric-greeting)
  - [7. Calculation Endpoint (`GET /sum/:num1/:num2`)](#7-calculation-summation)
  - [8. Semantic HTML Views](#8-semantic-html-views)
- [Database Design & Persistence Documentation (ddd.md)](#-database-design--persistence-documentation-dddmd)
- [🛡️ Middleware Architecture & Reliability Guardians (Week 7 Milestone)](#️-middleware-architecture--reliability-guardians-week-7-milestone)
- [Local Development & Testing](#-local-development--testing)
- [Environment Configuration](#-environment-configuration)
- [Containerization Details](#-containerization-details)

---

## 🎯 Project Philosophy

1. **Clean-Room Implementation**: Fully crafted from scratch, adhering to software engineering best practices without relying on external boilerplate or peer codebases.
2. **The "One-Command Rule"**: Zero manual pre-configuration required. The entire stack boots deterministically with:
   ```bash
   docker compose up --build
   ```
3. **Instructor Milestone Isolation (Week 3 & 4)**: As required by the instructor (*"without database connection / in-memory only"*), all User Management CRUD operations utilize a dedicated thread-safe in-memory data store with deep cloning immutability and pre-seeded sample data, strictly decoupled from persistent tables.
4. **MVC Architecture & Dual Controller Routing (Week 4)**: Clear separation of concerns between user-facing browser views and machine-facing REST APIs. Implements an in-memory `UserModel` (`backend/src/models/user.model.js`), dual controllers (`ApiUserController` for pure JSON REST vs `UserController` for semantic HTML view rendering), and an interactive browser-based user management portal at `/users`.
5. **Interactive OpenAPI 3.0 Documentation**: Fully interactive Swagger UI exposed at `/api/swagger` and `/api/docs` allowing instant endpoint discovery and browser testing.
6. **Database Persistence & Migration Design (Week 5)**: Formally planned and documented in [ddd.md](./ddd.md). Establishes the relational schema, PostgreSQL 16 persistence with named volume `postgres_data`, container health probes, and migration strategy.
7. **Relational Schema & Multi-Entity Associations (Week 6 - Phase 1)**: Fully documented in [ddd.md](./ddd.md). Implements One-to-Many (`users (1) ───< (N) job_postings`) and Many-to-Many (`users (N) >───< (M) job_postings` via `applications` join entity), `ON DELETE CASCADE` referential integrity, and `UNIQUE(user_id, job_posting_id)` business rule mapping to HTTP `409 Conflict`.

---

## 🏛️ MVC Architecture Specification

The Alumni Tracking System enforces a strict **Model-View-Controller (MVC)** architectural design, augmented with Service and In-Memory Repository layers for enterprise separation of concerns and deterministic testing.

### 1. Dual Controller & Route Architecture

The platform separates client concerns into two dedicated pipelines:

```
                            ┌───────────────────────────┐
                            │   HTTP Client / Browser   │
                            └─────────────┬─────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
           [GET /users View Route]                     [GET /api/users REST Route]
                    │                                           │
                    ▼                                           ▼
        ┌───────────────────────┐                   ┌───────────────────────┐
        │    UserController     │                   │   ApiUserController   │
        │ (src/controllers/     │                   │  (src/controllers/    │
        │   user.controller.js) │                   │ apiUser.controller.js)│
        └───────────┬───────────┘                   └───────────┬───────────┘
                    │                                           │
                    ▼                                           ▼
        ┌───────────────────────┐                   ┌───────────────────────┐
        │      View Layer       │                   │      JSON Envelope    │
        │  (src/views/users.html│                   │   (RESTful Responses  │
        │   + public/css/       │                   │    200, 201, 400, 404)│
        │     style.css)        │                   └───────────┬───────────┘
        └───────────┬───────────┘                               │
                    │                                           │
                    └─────────────────────┬─────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │      UserService      │
                              │ (src/services/        │
                              │   user.service.js)    │
                              └───────────┬───────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │       UserModel       │
                              │  (src/models/         │
                              │    user.model.js)     │
                              └───────────┬───────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │ In-Memory Repository  │
                              │ (src/repositories/    │
                              │   inMemoryUser.repo)  │
                              └───────────────────────┘
```

### 2. Exact Mapping of Models, Views & Controllers

| Layer | Component | File Path | Architectural Role & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Model** | `UserModel` | `backend/src/models/user.model.js` | **In-Memory Domain Entity & Data Access Abstraction**<br>• Implements complete CRUD: `findAll`, `findById`, `findByEmail`, `create`, `update`, `delete`, `count`, `reset`.<br>• Enforces thread safety and defensive deep cloning immutability to prevent mutation leaks.<br>• Operates entirely in-memory without database connection per course rules. |
| **Model** | `AnnouncementModel` | `backend/src/models/announcement.model.js` | **In-Memory Announcement Entity & Data Access**<br>• Implements complete CRUD: `findAll`, `findById`, `create`, `update`, `delete`, `count`, `reset`.<br>• Pre-seeded with 3 realistic bulletins (Homecoming, Career Fair, Tech Speaker Series).<br>• Defensive cloning (`_clone`) ensures immutability against outside reference mutations. |
| **Model** | `InMemoryUserRepository` | `backend/src/repositories/inMemoryUser.repository.js` | **In-Memory Collection Store**<br>• Maintains thread-safe in-memory state and pre-seeded sample records (Ada Lovelace, Alan Turing, Grace Hopper, Margaret Hamilton). |
| **View** | `Users View` | `backend/src/views/users.html` | **Interactive Browser-Based CRUD Portal (`GET /users`)**<br>• Responsive semantic HTML5 table with status/role badges.<br>• Real-time search by name/email and role filtering dropdown.<br>• Interactive modal forms for **User Creation** and **User Editing**.<br>• Delete confirmation dialog with reactive DOM removal and counter updates.<br>• Toast notification system for instant feedback.<br>• Dynamic server-side hydration placeholder (`<!-- INITIAL_USERS_DATA -->`) for zero-flash page loads. |
| **View** | `Announcements View` | `backend/src/views/announcements.html` | **Interactive Browser-Based Announcements Portal (`GET /announcements`)**<br>• Card/grid layout with category (`academic`, `career`, `social`) and priority (`urgent`, `normal`, `low`) badges.<br>• Real-time keyword search and category filtering dropdown.<br>• Create modal (`POST /api/announcements`), Edit modal (`PUT /api/announcements/:id`), and Delete dialog.<br>• Server-side hydration placeholder (`<!-- INITIAL_ANNOUNCEMENTS_DATA -->`) and form-POST fallback. |
| **View** | `Home View` | `backend/src/views/home.html` | **System Landing Page (`GET /home`)**<br>• Feature highlights, architecture overview, and endpoint links. |
| **View** | `About View` | `backend/src/views/about.html` | **Architecture & Specifications View (`GET /about`)**<br>• Detailed technology stack table, philosophy, and endpoint directory. |
| **View** | `Design System` | `backend/public/css/style.css` | **Unified Modern CSS Theme**<br>• Dark-mode slate palette, glassmorphism cards, responsive tables, badge variants, modal overlays, and toast animations. |
| **Controller (View)** | `UserController` | `backend/src/controllers/user.controller.js` | **View Layer Orchestration (`/users`)**<br>• Serves semantic HTML views with embedded pre-hydrated state (`getUsersView`).<br>• Handles traditional browser form submissions (`POST /users`, `handleCreateUser`) and redirects.<br>• Handles form deletions (`POST /users/:id/delete`, `handleDeleteUser`) and detail routing (`getUserDetailView`). |
| **Controller (View)** | `AnnouncementController` | `backend/src/controllers/announcement.controller.js` | **Announcements View Orchestration (`/announcements`)**<br>• Serves semantic HTML views with embedded pre-hydrated state (`getAnnouncementsView`).<br>• Handles traditional browser form submissions (`POST /announcements`, `handleCreateAnnouncement`) and redirects.<br>• Handles form deletions (`POST /announcements/:id/delete`) and detail routing. |
| **Controller (API)** | `ApiUserController` | `backend/src/controllers/apiUser.controller.js` | **RESTful User API Endpoint Orchestration (`/api/users`)**<br>• Returns pure JSON envelopes for REST clients (`getUsers`, `getUserById`, `createUser`, `updateUser`, `patchUser`, `deleteUser`).<br>• Enforces standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`). |
| **Controller (API)** | `ApiAnnouncementController` | `backend/src/controllers/apiAnnouncement.controller.js` | **RESTful Announcement API Endpoint Orchestration (`/api/announcements`)**<br>• Returns pure JSON envelopes for REST clients (`getAnnouncements`, `getAnnouncementById`, `createAnnouncement`, `updateAnnouncement`, `patchAnnouncement`, `deleteAnnouncement`).<br>• Enforces standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`). |
| **Service Layer** | `UserService` | `backend/src/services/user.service.js` | **User Business Logic & Validation**<br>• Email format regex validation, required field checks, duplicate email conflict detection (`409`), and payload sanitization. |
| **Service Layer** | `AnnouncementService` | `backend/src/services/announcement.service.js` | **Announcement Business Logic & Validation**<br>• Enforces schema validation (`academic|career|social`, `low|normal|urgent`, title & content lengths). |

### 3. Route Dispatching Specification

- **`/users` (MVC View Route)**: Handled by `UserController` (`backend/src/routes/user.routes.js` mounted directly in `backend/src/routes/index.js`). Returns semantic HTML5 pages for human interaction.
- **`/api/users` (REST API Route)**: Handled by `ApiUserController` (`backend/src/routes/apiUser.routes.js` mounted in `backend/src/routes/api.routes.js`). Returns pure JSON responses for programmatic clients and Swagger UI.

---

## 🏛️ Architecture & Layering

The backend follows an enterprise modular 5-tier architecture:

```
[ HTTP Client / Browser / Swagger UI ]
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ Express Application (src/app.js)             │
│ - Helmet Security Headers & Content Security │
│ - CORS & HTTP Request Logging (Morgan)       │
│ - Static Asset Serving (public/)             │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Route Layer (src/routes/)                    │
│ - Main Aggregator (src/routes/index.js)      │
│ - /api Subrouter (src/routes/api.routes.js)  │
│ - User Routes with OpenAPI JSDoc specs       │
│ - Swagger UI & OpenAPI Specification routes  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Controller Layer (src/controllers/)          │
│ - HTTP request parameter parsing & dispatch  │
│ - REST status responses (200, 201, 400, 404) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Service Layer (src/services/)                │
│ - Input validation (RFC email regex, schema) │
│ - Business logic & conflict detection (409)  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ In-Memory Repository (src/repositories/)     │
│ - Thread-safe operations & defensive cloning │
│ - Seed dataset (Ada, Turing, Hopper, etc.)   │
│ - CRUD: findAll, findById, create, update... │
└──────────────────────────────────────────────┘
```

---

## 📂 Directory Structure

```text
.
├── .env                  # Default environment values for instant execution
├── .env.example          # Documented template for configuration variables
├── .gitignore            # Git exclusion rules for node_modules, logs, volumes
├── docker-compose.yml    # Root-level multi-container orchestration
├── README.md             # Architecture, API & deployment documentation
└── backend/
    ├── Dockerfile        # Production multi-stage Alpine Node.js 20 image
    ├── .dockerignore     # Docker build context exclusions
    ├── package.json      # NPM dependencies, scripts, and metadata
    ├── package-lock.json # Deterministic dependency lockfile
    ├── public/           # Static assets (stylesheets, branding)
    │   └── css/
    │       └── style.css # Unified design system (dark-mode, badges, modals, toasts)
    ├── src/
    │   ├── app.js        # Express application configuration & middlewares
    │   ├── server.js     # Server bootstrap & graceful shutdown handler
    │   ├── config/
    │   │   ├── db.js     # PostgreSQL connection pool & health ping
    │   │   ├── env.js    # Centralized environment variable validator
    │   │   └── swagger.js # OpenAPI 3.0 specification definition
    │   ├── models/
    │   │   ├── announcement.model.js # [Model] In-memory announcement model & CRUD
    │   │   └── user.model.js         # [Model] In-memory user model & CRUD abstraction
    │   ├── controllers/
    │   │   ├── announcement.controller.js    # [Controller: View] Serves announcements HTML view (/announcements)
    │   │   ├── apiAnnouncement.controller.js # [Controller: API] Handles JSON REST CRUD (/api/announcements)
    │   │   ├── apiUser.controller.js         # [Controller: API] Handles JSON REST CRUD (/api/users)
    │   │   ├── user.controller.js            # [Controller: View] Serves semantic HTML views (/users)
    │   │   ├── greeting.controller.js
    │   │   ├── health.controller.js
    │   │   ├── info.controller.js
    │   │   └── math.controller.js
    │   ├── middlewares/
    │   │   ├── errorHandler.js
    │   │   └── notFoundHandler.js
    │   ├── repositories/
    │   │   └── inMemoryUser.repository.js # Thread-safe in-memory store
    │   ├── routes/
    │   │   ├── announcement.routes.js    # MVC View routes for /announcements
    │   │   ├── apiAnnouncement.routes.js # REST API routes for /api/announcements
    │   │   ├── api.routes.js             # Aggregates /api routes (/api/users, /api/announcements, /api/health)
    │   │   ├── apiUser.routes.js         # REST API routes for /api/users
    │   │   ├── user.routes.js            # MVC View routes for /users
    │   │   ├── greeting.routes.js
    │   │   ├── health.routes.js          # GET /health & GET /api/health
    │   │   ├── index.js                  # Main top-level router dispatcher
    │   │   ├── info.routes.js
    │   │   ├── math.routes.js
    │   │   └── swagger.routes.js         # Swagger UI (/api/swagger, /api/docs)
    │   ├── services/
    │   │   ├── announcement.service.js   # Announcement validation & business logic
    │   │   ├── greeting.service.js
    │   │   ├── health.service.js
    │   │   ├── math.service.js
    │   │   └── user.service.js
    │   ├── utils/
    │   │   ├── logger.js
    │   │   └── responseFormatter.js
    │   └── views/
    │       ├── announcements.html # [View] Interactive announcements management portal
    │       ├── users.html         # [View] Interactive in-memory user CRUD management portal
    │       ├── about.html         # Semantic HTML architecture view
    │       └── home.html          # Modern landing page with interactive API explorer
    └── tests/
        └── api.test.js   # 69 automated integration & unit tests (100% pass)
```

---

## 🚀 Quick Start: The One-Command Rule

To run the complete system with all networking and services configured:

```bash
docker compose up --build
```

Once running:
- **Interactive Announcements Portal (MVC View)**: [http://localhost:3000/announcements](http://localhost:3000/announcements)
- **Interactive Users Portal (MVC View)**: [http://localhost:3000/users](http://localhost:3000/users)
- **Interactive Swagger Documentation**: [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger) (also [http://localhost:3000/api/docs](http://localhost:3000/api/docs))
- **Web Interface Landing Page**: [http://localhost:3000/home](http://localhost:3000/home)
- **Announcements REST API (Pure JSON)**: [http://localhost:3000/api/announcements](http://localhost:3000/api/announcements)
- **Users REST API (Pure JSON)**: [http://localhost:3000/api/users](http://localhost:3000/api/users)
- **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **About / Technical Architecture**: [http://localhost:3000/about](http://localhost:3000/about)

---

## 📖 Swagger & Interactive API Documentation

Interactive OpenAPI 3.0 documentation is exposed at:
- **Swagger UI**: `http://localhost:3000/api/swagger` and `http://localhost:3000/api/docs`
- **Raw OpenAPI JSON**: `http://localhost:3000/api/swagger.json` and `http://localhost:3000/api/docs.json`

Users can inspect all request models, response schemas, and execute live API calls directly from their browser.

---

## 📡 API Reference & Contract

### 1. Health Check
Returns operational status, uptime, ISO timestamp, and platform diagnostics.

- **Route**: `GET /api/health` (also legacy `GET /health` and `GET /`)
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "service": "Alumni Tracking System",
  "environment": "production",
  "uptime": 60,
  "uptimeHuman": "1m 0s",
  "timestamp": "2026-10-01T01:00:00.000Z",
  "system": {
    "platform": "linux",
    "nodeVersion": "v20.x.x",
    "memoryUsageMB": 62
  },
  "database": {
    "connected": true
  }
}
```

```bash
curl -X GET http://localhost:3000/api/health
```

---

### 2. In-Memory User Management CRUD

#### User Model
```json
{
  "id": "11111111-1111-4111-a111-111111111111",
  "name": "Ada Lovelace",
  "email": "ada.lovelace@alumni.edu",
  "role": "admin",
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

#### Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List all users in in-memory store | `200 OK` |
| `POST` | `/api/users` | Create user `{ name, email, role }` | `201 Created` |
| `GET` | `/api/users/:id` | Get user by UUID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/users/:id` | Full update of existing user | `200 OK` / `404 Not Found` |
| `PATCH`| `/api/users/:id` | Partial update of existing user | `200 OK` / `404 Not Found` |
| `DELETE`| `/api/users/:id` | Delete user from in-memory store | `200 OK` / `404 Not Found` |

#### Example Usage

**1. Create User**:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Donald Knuth", "email": "knuth@alumni.edu", "role": "faculty"}'
```
*Response (`201 Created`)*:
```json
{
  "id": "813a235b-d40f-4098-b6f3-39f8c2c6a2cb",
  "name": "Donald Knuth",
  "email": "knuth@alumni.edu",
  "role": "faculty",
  "createdAt": "2026-10-01T01:05:35.951Z",
  "updatedAt": "2026-10-01T01:05:35.951Z"
}
```

**2. List All Users**:
```bash
curl -X GET http://localhost:3000/api/users
```

**3. Get by ID**:
```bash
curl -X GET http://localhost:3000/api/users/11111111-1111-4111-a111-111111111111
```

**4. Update User (PUT / PATCH)**:
```bash
curl -X PATCH http://localhost:3000/api/users/11111111-1111-4111-a111-111111111111 \
  -H "Content-Type: application/json" \
  -d '{"role": "dean"}'
```

**5. Delete User**:
```bash
curl -X DELETE http://localhost:3000/api/users/11111111-1111-4111-a111-111111111111
```

---

### 3. Interactive MVC Users Portal (`GET /users`)

The primary web-based interface for managing alumni records in the in-memory store.

- **Route**: `GET /users` (served by `UserController`)
- **Response**: `200 OK` (`Content-Type: text/html; charset=utf-8`)
- **Key Capabilities**:
  - **Pre-Hydrated Table**: Embeds server-side user data into the HTML template on first load for zero latency.
  - **Live Search & Filter**: Real-time filtering by name, email, and system role (`admin`, `alumni`, `student`, `faculty`).
  - **Modal Creation**: Interactive modal to create new users directly against `/api/users` (with fallback support for standard form `POST /users`).
  - **In-Place Edit**: Interactive modal to update existing user names, emails, and roles via `PUT /api/users/:id`.
  - **Safe Deletion**: Confirmation dialog that triggers `DELETE /api/users/:id` and optimistically removes rows.
  - **Real-Time Statistics**: Live dynamic counts for Total Users, Administrators, Alumni, and Students.
  - **Toast Notifications**: Reactive feedback popups on success or failure.

---

### 4. In-Memory Announcement Management CRUD (`/api/announcements`)

#### Announcement Model
```json
{
  "id": "a1111111-2222-4333-a444-555555555555",
  "title": "Annual Alumni Homecoming & Reunion 2026",
  "content": "Join us for the 25th Annual Alumni Homecoming on main campus. Network with past graduates, attend faculty seminars, and enjoy evening festivities.",
  "category": "social",
  "author": "Alumni Relations Office",
  "priority": "urgent",
  "createdAt": "2026-09-01T10:00:00.000Z",
  "updatedAt": "2026-09-01T10:00:00.000Z"
}
```

#### Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/announcements` | List all announcements with optional `?category=` and `?priority=` filters | `200 OK` |
| `POST` | `/api/announcements` | Create announcement `{ title, content, category, author, priority }` | `201 Created` |
| `GET` | `/api/announcements/:id` | Get announcement by UUID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/announcements/:id` | Full update of existing announcement | `200 OK` / `404 Not Found` |
| `PATCH`| `/api/announcements/:id` | Partial update of existing announcement | `200 OK` / `404 Not Found` |
| `DELETE`| `/api/announcements/:id` | Delete announcement from in-memory store | `200 OK` / `404 Not Found` |

#### Example Usage

**1. Create Announcement**:
```bash
curl -X POST http://localhost:3000/api/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI & Big Data Alumni Panel 2026",
    "content": "A high-level keynote and Q&A session with industry pioneers graduating from our department.",
    "category": "academic",
    "author": "Computer Science Department",
    "priority": "urgent"
  }'
```

**2. Filter by Category**:
```bash
curl -X GET "http://localhost:3000/api/announcements?category=career"
```

**3. Update Announcement**:
```bash
curl -X PUT http://localhost:3000/api/announcements/a1111111-2222-4333-a444-555555555555 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Annual Alumni Homecoming & Reunion 2026 (Updated Venue)",
    "content": "Venue has moved to Grand Alumni Auditorium. Refreshments served.",
    "category": "social",
    "author": "Alumni Relations Office",
    "priority": "urgent"
  }'
```

**4. Delete Announcement**:
```bash
curl -X DELETE http://localhost:3000/api/announcements/a1111111-2222-4333-a444-555555555555
```

---

### 5. Interactive MVC Announcements Portal (`GET /announcements`)

The primary web-based interface for managing campus notices, career fairs, and alumni events.

- **Route**: `GET /announcements` (served by `AnnouncementController`)
- **Response**: `200 OK` (`Content-Type: text/html; charset=utf-8`)
- **Key Capabilities**:
  - **Dynamic Card Grid**: Visual card presentation displaying title, category badge (`academic`, `career`, `social`), priority badge (`urgent`, `normal`, `low`), preview content, author, and timestamp.
  - **Live Search & Category Filtering**: Instant client-side filtering by keywords across title, content, or author, plus category dropdown selector.
  - **Interactive Creation Modal**: Modal with real-time validation submitting to `POST /api/announcements`.
  - **In-Place Edit Modal**: Populates existing bulletin fields for seamless updates via `PUT /api/announcements/:id`.
  - **Detail View Modal**: Inspects complete announcement text and metadata in a read-only popup.
  - **Safe Deletion Dialog**: Confirmation modal triggering `DELETE /api/announcements/:id` with reactive DOM card removal.
  - **Real-Time Overview Metrics**: Live counters for Total Bulletins, Academic Notices, Career & Jobs, and Social & Alumni events.
  - **Pre-Hydrated Zero-Flash Loading**: Pre-injected initial state via `<!-- INITIAL_ANNOUNCEMENTS_DATA -->`.

---

### 6. Parametric Greeting
Accepts a name in the URL path and returns a personalized greeting.

- **Route**: `GET /hello/:name`
- **Response**: `200 OK`
```json
{
  "status": "success",
  "name": "Alice",
  "message": "Hello, Alice! Welcome to the Alumni Tracking System.",
  "timestamp": "2026-10-01T01:00:00.000Z"
}
```

---

### 7. Calculation (Summation)
Performs strict arithmetic addition with input validation and error diagnostics.

- **Route**: `GET /sum/:number1/:number2`
- **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "operation": "sum",
    "number1": 15,
    "number2": 27,
    "result": 42
  }
  ```

---

### 8. Semantic HTML Views
Render modern, responsive, styled user interfaces.

- **`GET /announcements`**: Interactive MVC Announcement Portal & Bulletin Board.
- **`GET /users`**: Interactive MVC User Directory & Management Portal.
- **`GET /home`**: Platform landing view, feature highlights, and interactive API links.
- **`GET /about`**: Technical specifications, system architecture, and coursework details.

---

## 🗄️ Database Design & Persistence Documentation (`ddd.md`)

The comprehensive database architecture, schema definitions, constraints, index performance strategy, and migration roadmaps are documented in the standalone **Data Design Document (DDD)**:

👉 **[Read the Full Data Design Document (ddd.md)](./ddd.md)** 👈

### Key Architectural Highlights:
* **Relational Storage**: PostgreSQL 16 Alpine containerized database service (`alumni_postgres`).
* **Zero Data Loss Guarantee**: High-durability persistent storage via Docker named volume `postgres_data` mapped to `/var/lib/postgresql/data`.
* **Entity Specifications**:
  * **`users` Table**: UUID primary key (`gen_random_uuid()`), name, RFC-compliant unique email (`LOWER(email)` unique index), role (`admin`, `alumni`, `student`), and UTC audit timestamps (`created_at`, `updated_at`).
  * **`announcements` Table**: UUID primary key, headline title, long-form content (`TEXT`), category (`academic`, `career`, `social`), author/department string, priority (`low`, `normal`, `urgent`), and UTC audit timestamps.
  * **`job_postings` Table (Week 6)**: UUID primary key, foreign key `user_id` referencing `users(id)` with `ON DELETE CASCADE` (1:N association), job title, company name, optional location, long-form description, and UTC audit timestamps.
  * **`applications` Table (Week 6)**: UUID primary key, foreign key `user_id` referencing `users(id)` with `ON DELETE CASCADE`, foreign key `job_posting_id` referencing `job_postings(id)` with `ON DELETE CASCADE`, status enum (`applied`, `interview`, `accepted`, `rejected`), composite unique constraint `uq_user_job_application UNIQUE (user_id, job_posting_id)` enforcing single application per candidate per job and mapping to HTTP `409 Conflict`, and UTC audit timestamps.
* **Association Topologies**:
  * **One-to-Many (1:N)**: `users (1) ───< (N) job_postings`
  * **Many-to-Many (N:M)**: `users (N) >───< (M) job_postings` mediated by `applications`
* **Deterministic Bootstrapping**: Docker Compose coordinates backend startup using PostgreSQL health probes (`pg_isready`), ensuring zero connection dropouts during container orchestration.
* **Sequential Transactional Migrations**: Handled by `backend/src/db/migrate.js` with `schema_migrations` tracking and automatic rollback safety.
* **Bidirectional Documentation**: [ddd.md](./ddd.md) links directly back to this [README.md](./README.md).

---

## 🛡️ Middleware Architecture & Reliability Guardians (Week 7 Milestone)

To guarantee enterprise robustness, observability, and graceful failure isolation across both REST clients and human browser interactions, the backend implements a clean, layered middleware pipeline:

```
[ Incoming HTTP Request ]
          │
          ▼
┌──────────────────────────────────────────────┐
│ 1. Request Logger Middleware (Top of Stack) │  ──► Logs: HH:MM:SS METHOD ROUTE STATUS DURATION
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 2. Security & Parsing (Helmet, CORS, JSON)   │  ──► Intercepts malformed JSON SyntaxErrors (400)
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 3. Static Assets (/public, /css)             │  ──► Serves css, icons, static 404.html
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 4. Route Controllers & Validation Middleware │  ──► validateJobPosting (title, company, city, desc)
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 5. 404 Guardian Catch-All (Pre-Error)        │  ──► REST: JSON { status, error, reason, path, method }
└──────────────────────┬───────────────────────┘  ──► Web: Renders 404.html + 5s auto-redirect
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 6. 5xx Guardian Global Handler (Last Handler)│  ──► REST: JSON { status, error, message, reason, stack }
└──────────────────────┬───────────────────────┘  ──► Web: Formatted Error 500 HTML view
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 7. File-Based Persistent Error Logging       │  ──► Appends to logs/error.log asynchronously
└──────────────────────────────────────────────┘
```

### 1. Task 1 & 2: Input Validation Middleware (`jobValidation.middleware.js`)
Mounted across all job creation and modification routes (`POST /api/jobs`, `PUT /api/jobs/:id`, `POST /api/users/:id/jobs`, `POST /jobs`):
* **Strict Business Rules**:
  * `"title"`: String, **REQUIRED**, maximum length **120 characters**, non-empty.
  * `"company"`: String, **REQUIRED**, non-empty.
  * `"city"`: Optional string (safely normalized with database `location` column).
  * `"description"`: Optional string.
* **Error Payload (`HTTP 400 Bad Request`)**:
  ```json
  {
    "status": "error",
    "error": "Validation failed",
    "message": "Validation failed for job posting payload",
    "details": [
      "Field \"title\" is required.",
      "Field \"company\" cannot be empty."
    ]
  }
  ```
* **Malformed JSON & Type Guard**:
  Invalid JSON syntax, non-object payloads (arrays, primitives), and missing bodies are caught with HTTP 400 without crashing the Node.js process or throwing unhandled 500 errors.

### 2. Task 3: Monotonic High-Precision Request Logger (`requestLogger.middleware.js`)
Mounted at the absolute intake of the Express pipeline to measure end-to-end request lifecycle duration:
* **Timing Mechanism**: Monotonic nanosecond calculation via `process.hrtime.bigint()` recorded at intake and resolved when `res.on('finish')` fires.
* **Output Format**:
  ```text
  <time> <method> <route> <restype> <duration>
  ```
  *Example Output:*
  ```text
  10:20:32 POST /jobs 201 18ms
  10:20:33 GET /api/health 200 1ms
  10:20:35 GET /css/style.css 200 0ms
  ```

### 3. Task 4: 404 Guardian Middleware (`notFoundGuardian.middleware.js`)
Positioned immediately after all application routes and before the global error handler:
* Distinguishes REST API consumers from browser interactions.
* **API Response (`HTTP 404 Not Found`)**:
  ```json
  {
    "status": "error",
    "error": "Not Found",
    "reason": "The requested resource or endpoint 'GET /api/nonexistent' does not exist on this server.",
    "path": "/api/nonexistent",
    "method": "GET"
  }
  ```

### 4. Task 5: 5xx Guardian Global Error Handler (`errorGuardian.middleware.js`)
Registered as the absolute **LAST** middleware in Express with exact 4-parameter signature `(err, req, res, next)`:
* **Error Classification**: Uses `err.status` or `err.statusCode` if set (e.g., 502, 503); defaults strictly to `500 Internal Server Error` for unexpected crashes.
* **Production Stack Masking**: When `NODE_ENV=production`, stack traces are hidden from JSON responses to prevent path and credential disclosure.
* **Standardized 5xx JSON Envelope**:
  ```json
  {
    "status": "error",
    "error": "Internal Server Error",
    "message": "A server-side error occurred while processing your request.",
    "reason": "Database connection timeout",
    "path": "/api/error-test",
    "method": "GET",
    "stack": "Error: Database connection timeout\n    at ..."
  }
  ```
* **Terminal Diagnostics**: Emits timestamped diagnostic logs to `console.error` before responding to the client.

### 5. Task 6: Persistent File-Based Error Logging (`fileLogger.js`)
Asynchronously appends server-side crashes (5xx) and unmapped route catches (404) to persistent disk storage:
* **File Target**: `backend/logs/error.log` (and root `logs/error.log`).
* **Format**:
  ```text
  [<ISO-Timestamp>] [<METHOD>] [<ROUTE>] [<STATUS_CODE>] Error: <message> | Stack: <stack trace>
  ```
* **Hygiene & Safety**:
  * Non-blocking stream append via `fs.promises.appendFile`.
  * Safe error boundaries prevent I/O errors from terminating the Node.js process.
  * Protected by `.gitignore` (`logs/`, `backend/logs/`, `*.log`) so logs are never committed.

### 6. Task 7: Generic 404 Page & Browser Redirection (`views/404.html`, `public/404.html`)
* **User-Facing 404 Experience**: When human users navigate to unmapped URLs via standard browser navigation (`Accept: text/html`), the server returns HTTP 404 with a semantic HTML view.
* **Features**:
  * Display of the requested endpoint reason.
  * Meta-refresh tag `<meta http-equiv="refresh" content="5; url=/jobs">`.
  * Client-side JavaScript countdown timer smoothly redirecting users to `/jobs` in 5 seconds.
  * Navigation shortcuts: `🏠 Go Back to Home` and `💼 Browse Jobs`.
* **REST Preservation**: Never serves HTML to API clients (`/api/*`, `req.xhr`, or JSON requests).

---

### 🔍 Verification & Local Testing Guide

#### 1. Automated Test Execution
Run the full automated test suite containing 135 tests across 24 suites:
```bash
cd backend
npm test
```

#### 2. Manual Verification with Curl / Postman

**A. Job Validation Error (`HTTP 400`)**:
```bash
# Title exceeding 120 characters
curl -i -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title": "'$(printf 'A%.0s' {1..125})'", "company": "Stripe"}'
```

**B. 404 Guardian API vs Browser**:
```bash
# API client receives JSON 404
curl -i http://localhost:3000/api/nonexistent-endpoint

# Browser receives HTML 404 with 5-second countdown
curl -i -H "Accept: text/html" http://localhost:3000/some-missing-page
```

**C. 5xx Guardian Global Error Handler**:
```bash
# Trigger diagnostic 500 error
curl -i http://localhost:3000/api/error-test
```

**D. Inspect Persistent Error Logs**:
```bash
tail -f backend/logs/error.log
```

---

## 🧪 Local Development & Testing

Run automated tests directly on your machine:

```bash
cd backend
npm test
```

**Test Results**:
```text
✔ Alumni Tracking System API Test Suite (135 tests passed, 0 failures)
  ✔ Health Check Endpoints (Legacy Root) (2 tests)
  ✔ Parametric Greeting Endpoint (2 tests)
  ✔ Calculation Endpoint (6 tests)
  ✔ Static & Info Views (2 tests)
  ✔ 404 Handling (1 test)
  ✔ Week 3: Health Check Endpoint (/api/health) (1 test)
  ✔ Week 3: Swagger / OpenAPI Documentation (4 tests)
  ✔ Week 3: In-Memory User CRUD Operations (/api/users) (13 tests)
  ✔ Week 4: MVC User View Layer (/users) (6 tests)
  ✔ Week 4: In-Memory UserModel Specification (8 tests)
  ✔ Week 4 Homework: In-Memory Announcement Model Specification (7 tests)
  ✔ Week 4 Homework: In-Memory Announcement CRUD Operations (/api/announcements) (11 tests)
  ✔ Week 4 Homework: Announcement View Layer (/announcements) (6 tests)
  ✔ Week 6: Job Postings API & Nested Routing (8 tests)
  ✔ Week 6: Applications API, Nested Routing & 409 Conflict (10 tests)
  ✔ Week 6 Homework: Job Postings View Layer (/jobs) (6 tests)
  ✔ Week 6 Homework: Applications View Layer (/applications) (6 tests)
  ✔ Tasks 1 & 2: Input Validation & Job Posting Rules (14 tests)
  ✔ Task 3: Custom Logger Middleware (3 tests)
  ✔ Task 4: 404 Guardian Middleware (4 tests)
  ✔ Task 5: 5xx Guardian Middleware (Global Error Handler) (7 tests)
  ✔ Task 6: File-Based Persistent Error Logging (5 tests)
  ✔ Task 7: Generic 404 Page & Invalid Request Redirection (4 tests)
```

---

## ⚙️ Environment Configuration

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Runtime mode (`development`, `production`, `test`) |
| `PORT` | `3000` | Port on which the Express server listens |
| `HOST` | `0.0.0.0` | Host binding interface |
| `APP_NAME` | `Alumni Tracking System` | Application display name |
| `DB_HOST` | `alumni_postgres` | PostgreSQL host (service name in Docker network) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `alumni_user` | PostgreSQL database user |
| `DB_PASSWORD` | `alumni_secure_password` | PostgreSQL password |
| `DB_NAME` | `alumni_db` | PostgreSQL target database name |

---

## 🐳 Containerization Details

- **Backend Dockerfile**: Multi-stage Alpine container (`node:20-alpine`), non-root `node` user, deterministic `npm ci --omit=dev`, internal healthcheck.
- **PostgreSQL Database (`alumni_postgres`)**: Isolated container running on Alpine 16 (`postgres:16-alpine`), persistent named volume `postgres_data` mounted at `/var/lib/postgresql/data`, health check configured via `pg_isready`.
- **Zero-Touch Startup**: `docker compose up --build` launches both services cleanly in dependency order (`condition: service_healthy`).
