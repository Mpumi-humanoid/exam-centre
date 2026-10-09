# Supabase account setup

For local development, start Supabase and open Studio at `http://127.0.0.1:54323`. For the hosted project, open its dashboard and use **Authentication → Users**. Create the student and lecturer accounts there using email addresses you control; if email confirmation is enabled, confirm the hosted accounts before signing in.

The example `.test` accounts below are for local development only. For a hosted project, replace those emails in the SQL below with the exact email addresses of the users created in that hosted project's **Authentication → Users** page, then run the SQL in that project's **SQL Editor**.

The profile details migration adds `gender` and `institutional_id` to `profiles`; use the supported gender values `male`, `female`, `non_binary`, or `prefer_not_to_say` when providing a value. Keep passwords in Supabase Auth and never store them in profile rows or frontend code.

Example local test users:

- `student.a@example.test`
- `student.b@example.test`
- `lecturer.a@example.test`
- `lecturer.b@example.test`

These local test users are separate from any hosted Supabase project.

## Assign the profiles and teaching/enrolment data

Open Studio's SQL Editor and replace the example emails/names below with the users you created. This SQL is for local development only and must be run as an administrator in Studio, not from the frontend.

```sql
insert into public.profiles (id, full_name, role)
select id, 'Student A', 'student'
from auth.users
where email = 'student.a@example.test'
on conflict (id) do update
set full_name = excluded.full_name, role = excluded.role;

insert into public.profiles (id, full_name, role)
select id, 'Student B', 'student'
from auth.users
where email = 'student.b@example.test'
on conflict (id) do update
set full_name = excluded.full_name, role = excluded.role;

insert into public.profiles (id, full_name, role)
select id, 'Lecturer A', 'lecturer'
from auth.users
where email = 'lecturer.a@example.test'
on conflict (id) do update
set full_name = excluded.full_name, role = excluded.role;

insert into public.profiles (id, full_name, role)
select id, 'Lecturer B', 'lecturer'
from auth.users
where email = 'lecturer.b@example.test'
on conflict (id) do update
set full_name = excluded.full_name, role = excluded.role;

insert into public.lecturer_modules (lecturer_id, module_id)
select p.id, m.id
from public.profiles p
join auth.users u on u.id = p.id
join public.modules m on m.code = 'CMPG211'
where u.email = 'lecturer.a@example.test'
on conflict do nothing;

insert into public.lecturer_modules (lecturer_id, module_id)
select p.id, m.id
from public.profiles p
join auth.users u on u.id = p.id
join public.modules m on m.code = 'CMPG212'
where u.email = 'lecturer.b@example.test'
on conflict do nothing;

insert into public.enrollments (student_id, module_id)
select p.id, m.id
from public.profiles p
join auth.users u on u.id = p.id
cross join public.modules m
where u.email = 'student.a@example.test'
on conflict do nothing;

insert into public.enrollments (student_id, module_id)
select p.id, m.id
from public.profiles p
join auth.users u on u.id = p.id
join public.modules m on m.code = 'CMPG212'
where u.email = 'student.b@example.test'
on conflict do nothing;
```

After setup, both lecturers can log in using the same sign-in page; their `profiles.role` routes them to the lecturer portal. The seeded assessments start unreleased. Student A is enrolled in all seeded modules, while Student B remains enrolled only in CMPG212. Lecturer A and Student A can use CMPG211 for the release flow; the separate CMPG212 assignment lets you test lecturer module scoping.
