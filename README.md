# Parent-School Hub

A unified communication platform for schools, replacing the patchwork of WhatsApp groups,
paper notices, SMS blasts, and Facebook posts that most schools still rely on.

One platform, three roles:

- **Parent** — homework, attendance, marks, fees, announcements, events, report cards
- **Teacher** — attendance, marks, homework, announcements
- **School (admin)** — communication, payments, reports

Intended as a B2B product sold to schools, hosting one school (tenant) per deployment's data
scoped by `SchoolId` throughout — the data model is already multi-school-ready.

## Current status

This is the initial foundation. Two modules are fully built end-to-end (API + UI + auth):

- **Announcements** — school-wide posts, created by Admin/Teacher, visible to everyone at the school
- **Attendance** — teachers mark daily attendance per class; parents view their child's history

Everything else (Homework, Marks, Fees, Events, Report Cards) exists only as EF Core data
models (see `backend/ParentSchoolHub.Api/Models/`) with no controller or UI yet — they're the
obvious next slice to build out, following the same pattern as Attendance.

## Stack

- **Backend**: ASP.NET Core 9 Web API, EF Core + SQLite, JWT bearer auth with role-based
  authorization (`Admin`, `Teacher`, `Parent`), Swagger/OpenAPI.
- **Frontend**: React + TypeScript (Vite), React Router, plain fetch-based API client.

No external services required — SQLite is a local file, so there's nothing to provision to run
this locally.

## Running locally

### Backend

```bash
cd backend/ParentSchoolHub.Api
dotnet run
```

Runs on `http://localhost:5080` (URL set via `--urls` if you want a different port). On first
run it creates `parentschoolhub.db`, applies migrations, and seeds demo data. Swagger UI is at
`http://localhost:5080/swagger`.

Demo accounts (password for all of them is `Password123!`):

| Role    | Email                     |
|---------|---------------------------|
| Admin   | admin@brightfield.edu     |
| Teacher | teacher@brightfield.edu   |
| Parent  | parent@brightfield.edu    |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and expects the API at `http://localhost:5080` (see
`.env.development`). Backend CORS is already configured to allow that origin.

## Project layout

```
backend/ParentSchoolHub.Api/
  Models/        EF Core entities for every module (built + stubbed)
  Data/          DbContext + demo data seeder
  Controllers/   Auth, Announcements, Attendance, SchoolData (classes/students lookups)
  Services/      JWT issuance, claims helpers
frontend/
  src/pages/     Route-level screens (Login, Announcements, Attendance)
  src/components/ Role-specific views (teacher marks attendance, parent views history)
  src/auth/      Auth context (JWT stored in localStorage)
  src/api/       Typed fetch client
```

## Notes for production

- The JWT signing key in `appsettings.json` is a placeholder — replace it with a real secret
  (environment variable or secret manager) before deploying anywhere real.
- SQLite is fine for local dev; a production multi-school deployment should move to a real
  server (e.g. PostgreSQL or SQL Server) — the EF Core provider is the only thing that needs
  to change.
- There's no self-service school signup yet (`POST /api/auth/register`); onboarding a new
  school currently means seeding it directly. That's a natural next feature alongside the
  stubbed modules above.
