# Alumni Hub — Brand Identity & Messaging Guidelines

> **Bidirectional Documentation Links**:
> This document defines the strategic brand identity, audience personas, and editorial voice for **Alumni Hub** (the user-facing platform powered by the **Alumni Tracking System**).
> - For visual tokens, typography scales, component specifications, and WCAG contrast rules, see [DESIGN.md](./DESIGN.md).
> - For relational database schemas and persistence architecture, see [ddd.md](./ddd.md).
> - For full system documentation, API reference, and deployment instructions, see [README.md](./README.md).

---

## Table of Contents

1. [Brand Identity & Positioning](#1-brand-identity--positioning)
2. [Mission & Vision](#2-mission--vision)
3. [Brand Personality, Voice & Tone](#3-brand-personality-voice--tone)
4. [User Personas](#4-user-personas)
   - [4.1 Alumni Persona — The Engaged Graduate](#41-alumni-persona--the-engaged-graduate)
   - [4.2 Student Persona — The Aspiring Candidate](#42-student-persona--the-aspiring-candidate)
   - [4.3 Recruiter Persona — The Talent Partner](#43-recruiter-persona--the-talent-partner)
   - [4.4 Secondary Persona — Campus Administrator & Faculty](#44-secondary-persona--campus-administrator--faculty)
5. [Messaging Guidelines & Copywriting Standards](#5-messaging-guidelines--copywriting-standards)
6. [Terminology Glossary & Naming Governance](#6-terminology-glossary--naming-governance)
7. [Navigation](#7-navigation)

---

## 1. Brand Identity & Positioning

### 1.1 Brand Architecture & Naming

| Context | Canonical Name | Usage Scope |
| :--- | :--- | :--- |
| **Primary Product Brand** | **Alumni Hub** | Navigation headers, landing copy, email subjects, student/alumni/recruiter portals, UI microcopy, marketing headlines. |
| **Technical / Institutional System Name** | **Alumni Tracking System** | OpenAPI/Swagger service metadata (`APP_NAME`), health endpoint payloads, architectural specs (`README.md`, `ddd.md`), `<title>` suffixes where automated test parity is required. |
| **Short Monogram / Crest** | **`AH`** | Compact square crest badge (`32px × 32px`), favicons, and mobile brand lockups. |

### 1.2 Brand Positioning Statement

> For **university graduates, current students, and partner recruiters** who want high-trust career mobility and lasting campus community, **Alumni Hub** is the **verified institutional career and network platform** that transforms scattered directories and ad-hoc job boards into a single structured ecosystem—connecting alumni-authored opportunities, transparent application lifecycles, and official campus bulletins with enterprise-grade reliability.

### 1.3 Brand Tagline & Elevator Pitch

- **Primary Tagline**: *Where Academic Legacy Meets Career Momentum.*
- **Short Descriptor (1 sentence)**: *The verified network connecting graduates, students, and partner recruiters through shared opportunities, transparent hiring workflows, and campus news.*
- **Brand Archetype**: **The Mentor & The Connector** — combining the credibility and institutional rigor of a university archive (Sage) with the forward-looking ambition and clarity of modern career technology (Explorer).

### 1.4 Core Brand Values

1. **Lifelong Continuity**: Graduation is a transition, not an exit. Every interaction reinforces an enduring relationship across cohorts.
2. **Reciprocal Mentorship**: Today's student is tomorrow's hiring manager. The platform makes giving back as frictionless as asking for guidance.
3. **Verified Trust**: Every opportunity, bulletin, and profile is anchored to a known academic community—eliminating the noise and spam of public job boards.
4. **Transparent Craft**: Clear application states (`applied` → `interview` → `accepted` / `rejected`), honest validation feedback, and predictable workflows respect users' time.
5. **Equitable Access**: Accessible design (WCAG 2.1 AA minimum), plain-language copy, and structured data give every student and graduate equal visibility into career pathways.

---

## 2. Mission & Vision

### 2.1 Mission

To empower universities and their extended communities with a trustworthy, high-clarity digital hub where alumni share opportunities, students launch meaningful careers, recruiters discover vetted talent, and campus announcements reach the right audience at the right moment.

### 2.2 Vision

To become the indispensable lifelong bridge between academia and industry—where every graduating class strengthens the next through transparent mentorship, high-signal job placement, and enduring institutional pride.

### 2.3 Strategic Pillars & Product Mapping

| Pillar | What Users Experience | Platform Capability |
| :--- | :--- | :--- |
| **Community Identity** | Curated, searchable member network with clear role recognition (`admin`, `alumni`, `student`, `faculty`). | Directory Portal (`/users`, `/api/users`) |
| **Career Mobility** | Alumni- and partner-authored vacancies with clean location, role, and company metadata. | Job Opportunities Board (`/jobs`, `/api/jobs`) |
| **Pipeline Transparency** | End-to-end application tracking with built-in duplicate prevention (`409 Conflict` guard). | Applications Tracker (`/applications`, `/api/applications`) |
| **Institutional Pulse** | Categorized (`academic`, `career`, `social`) and prioritized (`urgent`, `normal`, `low`) campus notices. | Announcements Portal (`/announcements`, `/api/announcements`) |
| **Engineering Openness** | Self-documenting APIs, health telemetry, and deterministic deployment. | Architecture & OpenAPI (`/about`, `/api/swagger`, `/api/health`) |

---

## 3. Brand Personality, Voice & Tone

### 3.1 Core Voice Attributes

Alumni Hub speaks with one consistent voice across every screen, modal, empty state, and API error message:

| We Are... | We Are Not... | Example (Do) | Example (Don't) |
| :--- | :--- | :--- | :--- |
| **Credible & Clear** | Bureaucratic or stiff | *"Publish an opportunity for current students and graduates."* | *"Submit employment requisition data into the institutional registry."* |
| **Warm & Encouraging** | Overly casual or slangy | *"Your application to Stripe has been submitted."* | *"Boom! You just shot your shot at Stripe 🚀🔥"* |
| **Action-Oriented** | Pushy or salesy | *"Filter open roles by work mode or company."* | *"Don't miss out—ACT NOW before these dream jobs vanish!"* |
| **Precise & Helpful** | Cryptic or overly technical (in UI) | *"You have already applied to this role. Track its status in Applications."* | *"Error 409: Constraint `uq_user_job_application` violated."* |

### 3.2 Situational Tone Matrix

While our **voice** never changes, our **tone** adapts to the user's emotional context:

| Context / Touchpoint | Tone | Writing Guidance |
| :--- | :--- | :--- |
| **Landing & Onboarding (`/home`)** | Inspiring, grounded, welcoming | Lead with tangible outcomes (hiring, mentorship, staying informed). Avoid vague buzzwords. |
| **Job Discovery & Posting (`/jobs`)** | Crisp, structured, energizing | Front-load role title, company, and work mode. Make publishing feel quick and impactful. |
| **Application Submission & Status (`/applications`)** | Reassuring, transparent, objective | Confirm receipt immediately. Frame status changes (`applied`, `interview`, `accepted`, `rejected`) respectfully and neutrally. |
| **Campus Bulletins (`/announcements`)** | Authoritative, scannable, timely | Highlight category and priority cleanly. Reserve `Urgent` for time-sensitive deadlines or venue changes. |
| **Validation Errors (`400 Bad Request`)** | Constructive, direct, zero-blame | Tell the user exactly which field needs attention and what format is expected (e.g., *"Job title must be 120 characters or fewer."*). |
| **Duplicate Guard (`409 Conflict`)** | Calm, protective, helpful | Explain that a duplicate submission was prevented to protect their existing record, and point to `/applications`. |
| **Missing Pages & Failures (`404` / `5xx`)** | Apologetic, steady, solution-first | Acknowledge the snag without exposing stack traces in production; provide immediate recovery links (`Home`, `Browse Jobs`). |
| **Developer & API Docs (`/about`, `/api/swagger`)** | Technical, exact, concise | Use precise REST conventions, schema types, and exact HTTP status codes. |

---

## 4. User Personas

Every design token, layout hierarchy, and microcopy decision in Alumni Hub serves three primary personas and one supporting operational persona.

### 4.1 Alumni Persona — The Engaged Graduate

- **Profile**: **Dr. Maya Lin** — Class of 2016, Staff Distributed Systems Engineer at a high-growth cloud company.
- **Role in System**: `alumni`
- **Primary Goals**:
  - Give back to her alma mater by posting open engineering and internship roles directly to trusted candidates.
  - Stay informed about department speaker panels, research symposiums, and annual reunions without sifting through crowded email newsletters.
  - Maintain an up-to-date directory presence so classmates and students can recognize her work.
- **Pain Points**:
  - Generic recruiting platforms flood her inbox with unvetted resumes.
  - Clunky university portals with 15-field forms discourage her from posting a job in under two minutes.
- **Key Workflows in Alumni Hub**:
  1. Opens `/jobs` → clicks **Post Opportunity** → fills Title, Company, Location/Work Mode, and Description (`POST /api/users/:userId/jobs`).
  2. Checks `/announcements` filtered by `social` or `academic` for upcoming homecoming or keynote invites.
  3. Browses `/users` to reconnect with fellow alumni and faculty.
- **Messaging Hook**: *"Share roles with talent you already trust—publish an alumni opportunity in under 60 seconds."*

### 4.2 Student Persona — The Aspiring Candidate

- **Profile**: **Kerem Yılmaz** — Senior B.S. Computer Engineering Student, Class of 2027, actively seeking his first full-time software engineering role or capstone internship.
- **Role in System**: `student`
- **Primary Goals**:
  - Discover curated roles posted by alumni who understand his curriculum and project rigor.
  - Apply cleanly without worrying about duplicate submissions or losing track of where each application stands.
  - Never miss urgent career fair announcements or scholarship deadlines.
- **Pain Points**:
  - Applying into "black hole" job boards with zero visibility into application status.
  - Visual clutter and low-contrast interfaces that make comparing 10+ job cards exhausting on a laptop or phone.
- **Key Workflows in Alumni Hub**:
  1. Visits `/jobs` → searches by role/company and filters by `Remote` / `Hybrid` / `On-site` → inspects full requirements → submits an application (`POST /api/jobs/:id/applications`).
  2. Monitors `/applications` to watch progress across `Applied` → `Interview` → `Accepted`.
  3. Scans `/announcements` for `Urgent` badges and `Career` bulletins.
- **Messaging Hook**: *"Turn campus credentials into career momentum—discover alumni-backed openings and track every application in one place."*

### 4.3 Recruiter Persona — The Talent Partner

- **Profile**: **Elena Vance** — Senior Technical Recruiter & University Relations Lead representing an institutional partner organization (often collaborating with alumni hiring managers).
- **Role in System**: `alumni` / `admin` partner account (organization representative authoring vacancies and advancing candidate states).
- **Primary Goals**:
  - Publish accurate, structured job postings that adhere to clear title and company standards.
  - Review candidate submissions quickly in a scannable table and advance qualified applicants from `applied` to `interview` and `accepted`.
  - Broadcast campus recruiting events and career fairs to both students and experienced alumni.
- **Pain Points**:
  - Duplicate candidate entries cluttering review pipelines.
  - Inconsistent job listing cards lacking clear company, work mode, or posting date metadata.
  - Slow, multi-page forms for updating candidate statuses one by one.
- **Key Workflows in Alumni Hub**:
  1. Publishes multiple structured roles in `/jobs` with strict schema validation (`title <= 120 chars`, required `company`).
  2. Operates `/applications` using status filters (`Applied`, `Interview`, `Accepted`, `Rejected`) and real-time search to review and update applicant statuses (`PATCH /api/applications/:id`).
  3. Coordinates with Alumni Relations to publish `Career` bulletins on `/announcements`.
- **Messaging Hook**: *"Hire high-signal graduates faster—structured job publishing, duplicate-free pipelines, and instant status management."*

### 4.4 Secondary Persona — Campus Administrator & Faculty

- **Profile**: **Prof. Hakan Demir / Alumni Relations Office** (`admin`, `faculty`)
- **Primary Goals**: Maintain accurate member records in `/users`, publish official `Urgent` and `Academic` bulletins in `/announcements`, and verify system health and API contracts (`/about`, `/api/health`, `/api/swagger`).
- **Messaging Hook**: *"Institutional governance with zero friction—curate members, broadcast official notices, and audit platform health from one hub."*

---

## 5. Messaging Guidelines & Copywriting Standards

### 5.1 Hero & Page-Header Formula

Every primary view (`/home`, `/users`, `/jobs`, `/applications`, `/announcements`, `/about`) follows a predictable 3-part editorial hierarchy:

1. **Eyebrow / Context Pill** (2–5 words, uppercase metadata): Orient the user without developer jargon (e.g., `ALUMNI NETWORK • DIRECTORY`, `CAREER BOARD • OPEN ROLES`).
2. **H1 Headline** (3–7 words, Title Case, benefit- or object-focused): e.g., *Career Opportunities*, *Member Directory*, *Application Tracker*, *Campus Bulletins*.
3. **Supporting Lead** (1–2 concise sentences, max 160 characters): Explain what the user can accomplish on this page in plain English.

### 5.2 Action Button & CTA Copy Rules

- Always use **Strong Verb + Specific Noun** (2–3 words max).
- Keep primary CTAs unambiguous and distinct from secondary navigation links.

| Action | Approved Label | Avoid |
| :--- | :--- | :--- |
| Create job posting | **Post Opportunity** or **Post a Job** | *Submit*, *Add*, *New* |
| Submit job application | **Apply Now** / **Submit Application** | *Send*, *Go*, *Click Here* |
| Add directory user | **Add Member** | *Create Record* |
| Publish bulletin | **Post Announcement** | *Insert Bulletin* |
| Inspect modal detail | **View Details** | *More*, *Info* |
| Destructive confirmation | **Delete Member** / **Remove Posting** | *OK*, *Yes* |
| Dismiss modal | **Cancel** or **Close** | *Abort*, *Back* |

### 5.3 Form Labels, Placeholders & Error Copy

- **Labels**: Always visible above the field (never rely solely on placeholder text as a label). Mark required fields cleanly with `*` and `aria-required="true"`.
- **Placeholders**: Provide realistic domain examples prefixed with `e.g.,` (e.g., `e.g., Senior Backend Engineer`, `e.g., Istanbul, TR (Hybrid)`).
- **Validation Errors (`400`)**: State the rule constructively in one sentence:
  - Missing title: *"Enter a job title (up to 120 characters)."*
  - Invalid email: *"Enter a valid email address, such as name@alumni.edu."*
- **Duplicate Conflict (`409`)**:
  - Application conflict: *"This candidate has already applied to this opportunity. Review or update their status in Applications."*
  - Duplicate email: *"A member with this email address already exists in the directory."*

### 5.4 Status & Category Vocabulary

Use standardized human-readable labels mapped 1:1 to backend enums:

- **User Roles**: `Admin`, `Alumni`, `Student`, `Faculty`
- **Application Lifecycle**: `Applied`, `Interview`, `Accepted`, `Rejected`
- **Announcement Categories**: `Academic`, `Career`, `Social`
- **Announcement Priorities**: `Urgent`, `Normal`, `Low`

### 5.5 Empty States & Toast Feedback

- **Empty States**: Combine (1) clear observation, (2) helpful reason, and (3) next-step CTA.
  - *Example*: **No matching opportunities found** — *Try clearing your location filter or searching by a different company name.* (`[Reset Filters]`)
- **Toast Notifications**: Short, past-tense confirmation (`<= 65` characters) stating what succeeded or why it failed.
  - *Success*: *"Opportunity published to the Career Board."*
  - *Error*: *"Unable to submit application: candidate has already applied."*

### 5.6 Emoji & Iconography Discipline

- Replace decorative raw emojis inside buttons, labels, and tables with crisp, accessible inline SVG icons (`16px`–`20px`, `aria-hidden="true"`) during the design system rollout.
- Never rely on color or emoji alone to convey status—always pair visual indicators with explicit text labels (WCAG 1.4.1).

---

## 6. Terminology Glossary & Naming Governance

| Use This (Brand-Aligned) | Avoid This (Internal / Jargon in User UI) | Notes |
| :--- | :--- | :--- |
| **Alumni Hub** | *Coursework App*, *Week 6 Homework* | Reserve milestone labels for `README.md` / `ddd.md`, not end-user headers or footers. |
| **Members** / **Directory** | *In-Memory Records*, *User Table* | Keep technical storage implementation details on `/about` and `/api/swagger`. |
| **Opportunities** / **Job Postings** | *Vacancy Entities*, *1:N Postings* | Use natural career language for students, alumni, and recruiters. |
| **Applications** | *Join Rows*, *M:N Submissions* | Keep relational terminology strictly in architectural documentation. |
| **Bulletins** / **Announcements** | *CRUD Notices* | Warm institutional framing. |
| **Work Mode** (`Remote`, `Hybrid`, `On-site`) | *City String* | Clear candidate filtering terminology. |

> **Engineering Note**: Automated test parity requirements (e.g., `<title>Alumni Tracking System | Home</title>` or specific route assertions in `backend/tests/api.test.js`) remain respected in HTML `<title>` tags and API payloads while on-page visual branding adopts **Alumni Hub**.

---

## 7. Navigation

- [Design System Specification (`DESIGN.md`)](./DESIGN.md)
- [Data Design Document (`ddd.md`)](./ddd.md)
- [Project Overview & API Reference (`README.md`)](./README.md)
