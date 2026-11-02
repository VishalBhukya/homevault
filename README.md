# HomeVault

A **household operating system**: one shared, secure place for a family's documents, tasks, calendar, contacts, receipts, warranties and emergency plans.

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4, Recharts |
| Backend | NestJS 11, Prisma 6, JWT auth |
| Database | PostgreSQL 16 |
| File storage | Local disk in development, Cloudinary in production |

```
homevault/
├── backend/            NestJS API  (http://localhost:4000/api)
│   ├── prisma/         schema.prisma, migrations, seed.ts (demo data)
│   └── src/            auth, household, tasks, events, contacts, documents, assets,
│                       receipts, emergency, dashboard, storage
├── frontend/           Next.js app (http://localhost:3100)
│   └── src/app/        landing page, login/register, /app/* dashboard pages
├── docker-compose.yml  local PostgreSQL
└── render.yaml         one-click Render deploy for the API
```

## Features

- **Landing page**: hero, problem, how it works, pillars, Receipt Intelligence, use cases, emergency readiness, security and pricing.
- **Auth & households**: register (creates a household with a 30-day Family trial), login, roles (Owner / Admin / Member), add or remove members.
- **Dashboard**: smart alerts (overdue tasks, expiring documents and warranties, spending spikes, subscriptions), monthly spending chart, upcoming events, readiness score.
- **Receipts / Receipt Intelligence**: enter receipts with line items and attach a photo or PDF. Includes spending by month and category, top merchants, HSA/FSA-eligible items, subscription detection, a savings finder, and automatic asset and warranty creation.
- **Tasks**: priorities, assignees, due dates, and recurrence (completing a recurring task schedules the next one).
- **Calendar**: month view with events and task due dates.
- **Documents**: vault with categories, file uploads, expiry tracking and an "include in emergency binder" option.
- **Assets & warranties**: home inventory with warranty status.
- **Contacts**: categories and emergency contacts.
- **Emergency binder**: nine sections, a readiness score, and a print/PDF view.
- **Life-event guides**: checklists (new baby, buying a home, travel, and more) that turn into tasks.

---

## 1. Run it locally

### Prerequisites
- **Node.js 20+** (22 LTS recommended) and npm
- **Docker Desktop** for the local PostgreSQL. If you'd rather use an existing Postgres, just point `DATABASE_URL` at it.

### Step 1: start the database
```bash
cd homevault
docker compose up -d          # Postgres on localhost:5434 (user/pass/db: homevault)
```

### Step 2: start the backend
```bash
cd backend
cp .env.example .env          # defaults work for local dev as-is
npm ci                        # installs deps + generates the Prisma client
npx prisma migrate deploy     # creates the tables
npm run db:seed               # optional: demo household
npm run start:dev             # API on http://localhost:4000/api
```
Check it: <http://localhost:4000/api/health> should return `{"status":"ok"}`.

### Step 3: start the frontend (new terminal)
```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm ci
npm run dev                   # http://localhost:3100
```

Open <http://localhost:3100> and either **Start free trial** to create an account, or sign in with the demo account:

> **demo@homevault.app** / **demo1234**  (a second member: sam@homevault.app / demo1234)

### Useful commands
| Where | Command | What it does |
|---|---|---|
| backend | `npm run db:seed` | (Re)creates the demo household |
| backend | `npm run db:reset` | Drops all data, re-applies migrations, and seeds |
| backend | `npx prisma studio` | Browse the database in a GUI |
| backend | `npm run prisma:migrate -- --name <name>` | Create a migration after editing `schema.prisma` |
| frontend | `npm run build && npm start` | Production build on port 3100 |

> **Ports:** the frontend runs on **3100** and the API on **4000**. To change them, update `frontend/package.json`, `frontend/.env.local` (`NEXT_PUBLIC_API_URL`) and `backend/.env` (`PORT`, `FRONTEND_URL`).

> **npm 11 note:** `backend/package.json` contains an `allowScripts` block so npm 11+ is allowed to run Prisma's install scripts. If you see `prisma generate` errors after installing, run `npx prisma generate` in `backend/`.

---

## 2. Deploy for free

```
Browser ──► Vercel (Next.js) ──► Render (NestJS API) ──► Neon (PostgreSQL)
                                        └──────────────► Cloudinary (uploaded files)
```

Push the project to a GitHub repo first; Vercel and Render both deploy from GitHub.

### A. Database: Neon (free)
1. Sign up at <https://neon.tech> and create a project.
2. Copy the connection string. Use the **direct** (non-pooled) one so Prisma migrations work. It looks like
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

### B. File storage: Cloudinary (free)
Render's free disk is wiped on every restart, so uploads must go to cloud storage.
1. Sign up at <https://cloudinary.com>.
2. On the dashboard, copy the **API environment variable**: `cloudinary://<key>:<secret>@<cloud_name>`.

### C. Backend: Render (free)
1. <https://render.com> → **New → Blueprint** → select your repo (it reads `render.yaml`).
   Or use **New → Web Service** with: root directory `backend`, build `npm ci && npm run build`, start `npm run start:prod`, health check `/api/health`.
2. Fill in the environment variables:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon connection string |
   | `JWT_SECRET` | auto-generated by the blueprint, or any long random string |
   | `FRONTEND_URL` | your Vercel URL, e.g. `https://homevault.vercel.app` (comma-separate several) |
   | `PUBLIC_API_URL` | this service's URL, e.g. `https://homevault-api.onrender.com` |
   | `CLOUDINARY_URL` | from step B |
3. Deploy. `start:prod` runs `prisma migrate deploy` automatically on every start.
4. Optional demo data: in the Render **Shell** tab run `npm run db:seed`.

> On the free plan the service sleeps after about 15 minutes of no traffic, so the first request after that takes 30–60 seconds.

### D. Frontend: Vercel (free)
1. <https://vercel.com> → **Add New → Project** → import the repo.
2. Set **Root Directory** to `frontend` (the framework is detected as Next.js).
3. Add the environment variable `NEXT_PUBLIC_API_URL` = your Render URL (e.g. `https://homevault-api.onrender.com`, no trailing slash).
4. Deploy, then make sure Render's `FRONTEND_URL` matches the Vercel URL exactly (needed for CORS).

Free-tier limits change, so check each provider's current terms. Vercel's Hobby plan is for non-commercial use.

---

## API overview

All routes are under `/api`. Everything except `auth/register`, `auth/login` and `health` needs `Authorization: Bearer <token>`. Every record is scoped to the caller's household.

| Area | Endpoints |
|---|---|
| Auth | `POST auth/register`, `POST auth/login`, `GET auth/me` |
| Household | `GET/PATCH household`, `POST household/members`, `DELETE household/members/:id` (owner/admin) |
| CRUD | `tasks`, `events`, `contacts`, `documents`, `assets`, `emergency`: `GET`, `POST`, `PATCH /:id`, `DELETE /:id` |
| Receipts | `GET receipts`, `GET receipts/analytics?months=6`, `POST receipts`, `PATCH/DELETE receipts/:id` |
| Other | `GET dashboard`, `GET emergency/binder`, `POST uploads` (multipart `file`) |

## Security notes
- Passwords are hashed with bcrypt; sessions use signed JWTs (7-day expiry by default).
- All queries are filtered by `householdId`; member management is restricted to owners and admins.
- Request bodies are validated and unknown fields are rejected.
- Uploaded files are served at unguessable URLs but are **not** access-controlled. Use Cloudinary's authenticated delivery if you need private files.
- Billing is not connected: changing plans in Settings is free and instant.
