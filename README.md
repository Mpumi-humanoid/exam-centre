# Exam Centre

React and Supabase app with separate student, lecturer and admin portals. Students can review modules, released module/exam results, feedback, and their profile. Lecturers can manage results and release assessments for modules assigned to them.

## Local setup

Requirements: Node.js and Docker Desktop. On Windows, WSL and the Virtual Machine Platform are also required. They have been enabled on this machine; Windows returned restart-required status, so restart Windows before starting the local database. If Docker still reports virtualization is unavailable afterward, enable Intel VT-x/AMD-V (SVM) in BIOS/UEFI and start Docker Desktop again.

1. Run `npm install`.
2. Run `npm run db:start` to start the local Supabase services and apply the migration/seed data.
3. Run `npm run db:status` and copy the local API URL and anon key into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The local API defaults to `http://127.0.0.1:54321`; Studio is at `http://127.0.0.1:54323`. Never use a service-role key in this file.
4. Create test users in Studio's Authentication page, then run the profile/enrollment provisioning SQL in [LOCAL_SETUP.md](./supabase/LOCAL_SETUP.md).
5. Run `npm run dev`.

Use `npm run db:reset` to reapply migrations and starter module/assessment seed data. It clears local database contents, so recreate test Auth users and assignments after a reset. Stop services with `npm run db:stop`.

Build and lint with `npm run build` and `npm run lint`.

## Admin portal

Admins sign in at the normal login page and land on **Manage users** (`/admin/users`). From there they can search students and lecturers, open a profile (`/admin/users/:id`), and activate or deactivate the account. Deactivated users cannot sign in and the database hides their academic data.

Setup:

1. Apply the latest migration (`npm run db:reset` locally, or run `supabase/migrations/20261010120000_admin_user_management.sql` in the hosted project's SQL Editor).
2. Create the admin user in Authentication → Users, then make them an admin:

```sql
insert into public.profiles (id, full_name, role)
select id, 'Administrator', 'admin' from auth.users where email = 'admin@example.test'
on conflict (id) do update set role = 'admin', full_name = excluded.full_name;
```

Admins can only change the status of students and lecturers, never their own account.

## Security and data behavior

- Sign-in uses Supabase Auth email/password; the application loads `profiles.role` after authentication to route users.
- Every academic table has row-level security. Student result reads are restricted to the signed-in student, their enrolled modules, and released assessments. Lecturer result writes are restricted to enrolled students and assessments in modules assigned to that lecturer.
- `result_history` is populated by a database trigger on each result insert or update; students have no history access.
- The browser uses only the Supabase anon/publishable key from `VITE_SUPABASE_ANON_KEY`. Never add a service-role key to a `VITE_` variable or frontend bundle.
- For the manual isolation, write-protection, lecturer-boundary, and release checks, see [supabase/TESTING.md](./supabase/TESTING.md).
