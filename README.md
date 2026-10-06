# Jobs Platform

A job board with three roles: **job seekers** browse and apply, **companies** post jobs and review
applicants, and **admins** manage the platform. Laravel 12 REST API + React 19 single-page app.

## Features

**Job seekers**
- Browse open jobs with search, category, type, work mode, level and location filters (kept in the URL)
- Apply with a cover letter and a resume (PDF/DOC/DOCX), or reuse the resume saved on the profile
- Track every application and its status, withdraw while it is pending, save jobs for later

**Companies**
- Post, edit, close and delete jobs
- Get a notification each time someone applies; clicking it opens that job's applicants
- Applicants page: contact details, skills, cover letter, resume download, and a status
  (pending → reviewed → shortlisted → rejected / accepted) that notifies the applicant when it changes
- Dashboard with job and application counts

**Admins**
- Platform statistics, user management (suspend / delete), job moderation, category management

## Tech stack

| Layer | Tools |
| --- | --- |
| API | PHP 8.3, Laravel 12, Sanctum (Bearer tokens), API Resources, Policies, database notifications |
| Database | SQLite by default, MySQL supported |
| Tests | PHPUnit feature tests (23 tests) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, React Hook Form + Zod |

## Project structure

```
backend/    Laravel REST API (routes in routes/api.php)
frontend/   React single-page app
docs/       API reference (docs/API.md)
```

## Getting started

Requirements: PHP 8.3+, Composer, Node 20+.

```bash
# 1) API
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite        # skip if you switch to MySQL in .env
php artisan migrate:fresh --seed
php artisan serve                     # http://localhost:8000

# 2) Frontend
cd ../frontend
cp .env.example .env                  # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev                           # http://localhost:5173
```

To use MySQL, set `DB_CONNECTION=mysql` and the `DB_*` values in `backend/.env` before migrating.

### Demo accounts (password: `password`)

| Role | Email |
| --- | --- |
| Admin | `admin@jobs.test` |
| Company | `company@jobs.test` |
| Job seeker | `seeker@jobs.test` |

The seeder creates 6 companies, 29 jobs, 8 job seekers and sample applications.

### Tests

```bash
cd backend && php artisan test
cd frontend && npm run build && npm run lint
```

## Design notes

- The model is `JobPost` (table `job_posts`) because Laravel's queue already uses a `jobs` table.
- Authorization lives in policies: a company only ever sees and reviews applicants of its own jobs.
- Each application stores its own copy of the resume, so replacing the profile resume later does
  not change what a company already received. Resumes are on a private disk and served only
  through an authorized download endpoint.
- Admin accounts cannot be created through registration, and cannot be suspended or deleted from the panel.
- Notifications are stored in the database and polled by the front end every 20 seconds.
