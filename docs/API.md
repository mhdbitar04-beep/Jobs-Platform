# Jobs Platform API

Base URL: `http://localhost:8000/api`. JSON everywhere (send `Accept: application/json`).
Auth: `Authorization: Bearer <token>` (token returned by login/register).

Errors: `401 {message}` unauthenticated, `403 {message}` forbidden, `404 {message}`,
`422 {message, errors: {field: [msg, ...]}}` validation.

Paginated responses: `{ data: [...], meta: { current_page, last_page, per_page, total } }`.

## Shapes

```ts
type Role = 'seeker' | 'company' | 'admin'
type JobType = 'full_time' | 'part_time' | 'contract' | 'internship'
type WorkMode = 'onsite' | 'remote' | 'hybrid'
type Level = 'junior' | 'mid' | 'senior' | 'lead'
type JobStatus = 'open' | 'closed'
type AppStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'

interface Company { id: number; name: string; website: string|null; location: string|null;
  industry: string|null; size: string|null; description: string|null; open_jobs_count?: number }

interface User { id: number; name: string; email: string; role: Role; is_active: boolean;
  phone: string|null; location: string|null; headline: string|null; bio: string|null;
  skills: string[]; has_resume: boolean; company: Company|null; created_at: string }

interface Category { id: number; name: string; slug: string; jobs_count: number }

interface Job { id: number; title: string; description: string; requirements: string|null;
  location: string; type: JobType; work_mode: WorkMode; experience_level: Level;
  salary_min: number|null; salary_max: number|null; currency: string; skills: string[];
  status: JobStatus; deadline: string|null /* YYYY-MM-DD */; created_at: string;
  category: {id: number; name: string; slug: string}; company: Company;
  applications_count?: number;      // only on company/admin endpoints
  has_applied: boolean; is_saved: boolean }   // false for guests

interface Application { id: number; status: AppStatus; cover_letter: string|null;
  has_resume: boolean; created_at: string; job: Job;
  applicant?: { id: number; name: string; email: string; phone: string|null; location: string|null;
                headline: string|null; bio: string|null; skills: string[] } } // company/admin only

interface Notification { id: string; type: 'application_received' | 'application_status';
  title: string; message: string; link: string /* frontend path */; read_at: string|null; created_at: string }
```

## Auth
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | /auth/register | name, email, password, password_confirmation, role (`seeker`\|`company`), company_name (required when company) | 201 `{user, token}` |
| POST | /auth/login | email, password | `{user, token}` (422 on bad credentials, 403 if suspended) |
| POST | /auth/logout | – | 204 |
| GET | /auth/me | – | `{data: User}` |

## Profile (any signed-in user)
| PUT | /profile | name, phone, location, headline, bio, skills[] ; for companies also `company: {name, website, location, industry, size, description}` | `{data: User}` |
| POST | /profile/resume | multipart `resume` (pdf/doc/docx, ≤5 MB) | `{data: User}` |
| PUT | /profile/password | current_password, password, password_confirmation | 204 |

## Public
| GET | /stats | – | `{data: {jobs, companies, seekers, applications}}` |
| GET | /categories | – | `{data: Category[]}` |
| GET | /jobs | query: search, category (slug), type, work_mode, experience_level, location, sort (`latest`\|`salary`), page, per_page | paginated Job (open jobs only) |
| GET | /jobs/{id} | – | `{data: Job, related: Job[]}` |

## Seeker (role seeker)
| POST | /jobs/{id}/apply | multipart: cover_letter (optional), resume (optional file; falls back to profile resume; one of them is required) | 201 `{data: Application}` |
| GET | /my/applications | – | `{data: Application[]}` |
| DELETE | /my/applications/{id} | – | 204 (only while pending) |
| POST | /jobs/{id}/save | – | `{saved: boolean}` (toggle) |
| GET | /my/saved-jobs | – | `{data: Job[]}` |

## Company (role company)
| GET | /company/dashboard | – | `{data: {jobs_total, jobs_open, applications_total, applications_pending, recent_applications: Application[]}}` |
| GET | /company/jobs | – | `{data: Job[]}` with applications_count |
| POST | /company/jobs | title, category_id, description, requirements, location, type, work_mode, experience_level, salary_min, salary_max, skills[], deadline, status | 201 `{data: Job}` |
| GET | /company/jobs/{id} | – | `{data: Job}` |
| PUT | /company/jobs/{id} | same as POST | `{data: Job}` |
| DELETE | /company/jobs/{id} | – | 204 |
| GET | /company/jobs/{id}/applications | query: status | `{data: Application[], job: Job}` |
| GET | /company/applications | query: status | `{data: Application[]}` (all jobs) |
| PATCH | /company/applications/{id} | status | `{data: Application}` (notifies the applicant) |

## Shared
| GET | /applications/{id}/resume | – | file download (applicant, owning company, admin) |
| GET | /notifications | – | `{data: Notification[], unread_count: number}` |
| POST | /notifications/{id}/read | – | 204 |
| POST | /notifications/read-all | – | 204 |

## Admin (role admin)
| GET | /admin/stats | – | `{data: {users, seekers, companies, jobs, open_jobs, applications, jobs_by_category: {name, count}[], applications_by_status: Record<AppStatus, number>, recent_users: User[], recent_jobs: Job[]}}` |
| GET | /admin/users | query: search, role, page | paginated User |
| PATCH | /admin/users/{id} | is_active | `{data: User}` |
| DELETE | /admin/users/{id} | – | 204 |
| GET | /admin/jobs | query: search, status, page | paginated Job with applications_count |
| PATCH | /admin/jobs/{id} | status | `{data: Job}` |
| DELETE | /admin/jobs/{id} | – | 204 |
| POST | /admin/categories | name | 201 `{data: Category}` |
| PUT | /admin/categories/{id} | name | `{data: Category}` |
| DELETE | /admin/categories/{id} | – | 204 (422 if it still has jobs) |

## Demo accounts (password: `password`)
admin@jobs.test · company@jobs.test · seeker@jobs.test
