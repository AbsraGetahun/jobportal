# CareerPlus — How to Run (Step by Step)

CareerPlus is a Laravel 12 (PHP) REST API backend + a React 19 (Vite) frontend.
This guide gets the **entire app running locally** with all three dashboards
(Job Seeker, Employer, Admin) working end to end.

> Database note: the project is configured to use **SQLite** (`backend/database/database.sqlite`)
> out of the box — no MySQL/XAMPP setup is required. The schema is already migrated and seeded.

---

## Prerequisites (already present on this machine)
- PHP 8.2+ (XAMPP) and **Composer**
- **Node.js** 18+ and **npm**
- (MySQL is optional — not used by default)

---

## 1. Start the backend (Laravel API) — Terminal 1

```powershell
cd C:\Users\hp\Desktop\projects\job_portal\backend

# Only if vendor/ is missing:
composer install

# Only if .env is missing (it already exists):
copy .env.example .env
php artisan key:generate

# Database is already migrated + seeded. To rebuild from scratch:
php artisan migrate:fresh --seed --force

# Run the API server
php artisan serve --port=8000 --host=127.0.0.1
```
The API will be available at **http://127.0.0.1:8000/api**

## 2. Start the frontend (React + Vite) — Terminal 2

```powershell
cd C:\Users\hp\Desktop\projects\job_portal\career

# Only if node_modules/ is missing:
npm install

# Dev server (serves on port 3000, proxies /api to the backend)
npm run dev
```
The app will be available at **http://localhost:3000**

> Keep **both** terminals running. The frontend calls the backend directly
> (CORS is configured for `localhost:3000` and `127.0.0.1:3000`).

## 3. Open the app
Browse to **http://localhost:3000**

---

## 4. Login credentials

### Admin
- Email: `admin@jobportal.com`
- Password: `Admin123!`
- On the login page, press **Ctrl + Shift + A** to reveal the **Admin** role
  option, select it, then sign in. Admin lands on `/admin/dashboard`.

### Job Seeker
- Register a new account at `/register` (choose "Job Seeker"), or use the
  pre-seeded test account:
  - Email: `jstest@example.com` / Password: `Password1!`
- Lands on `/jobseekeraccount`.

### Employer
- Register a new account at `/register` (choose "Employer" → "I own a company"),
  or use the pre-seeded test account:
  - Email: `emptest@example.com` / Password: `Password1!`
- Lands on `/employeraccount`.

---

## 5. What works end to end (verified)
- **Auth**: register + login for all 3 roles, logout, profile fetch/update,
  password change, notification preferences.
- **Job Seeker**: profile, job search, job detail + apply (multipart),
  notifications, saved jobs, recommendations, resume page.
- **Employer**: company profile, post a job, view applicants, notifications,
  analytics, premium/subscription views.
- **Admin**: dashboard stats, manage job seekers / employers / jobs
  (approve–reject–feature), applications, feedback, reports, fraud alerts,
  CMS, support, system settings, notifications.
- **Workflow**: jobs posted by employers start as `pending` and only become
  publicly visible/applicable after an **Admin approves** them
  (`/admin/jobs` → approve).

---

## 6. Production build (optional)
```powershell
cd C:\Users\hp\Desktop\projects\job_portal\career
npm run build      # outputs to career/dist
npm run preview    # serves the built app on port 4173
```

---

## 7. Notes / things to configure for full features
- **Payments (Stripe)**: currently uses placeholder test keys in
  `backend/.env` (`STRIPE_KEY` / `STRIPE_SECRET` / `STRIPE_WEBHOOK_SECRET`)
  and `career/.env` (`VITE_STRIPE_PUBLISHABLE_KEY`). Subscription/payment
  flows require real Stripe test keys to function fully.
- **Email verification**: disabled in dev (`REQUIRE_EMAIL_VERIFICATION=false`
  in `backend/.env`), so new accounts can log in immediately.
- **Backend root cleanup**: ~146 leftover debug/scratch scripts were moved to
  `backend/_scratch/` (nothing was deleted) to keep the project tidy.

## Troubleshooting
- **Port already in use**: stop any running `php artisan serve` / `npm run dev`,
  or change the port (`--port=8080` / `npm run dev -- --port 3001`).
- **CORS error in browser**: ensure the backend is running on `127.0.0.1:8000`
  and you opened the frontend via `localhost:3000` or `127.0.0.1:3000`.
- **401 after login**: clear browser `localStorage` and log in again (old token).
