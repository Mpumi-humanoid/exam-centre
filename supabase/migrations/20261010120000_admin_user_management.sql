-- Admin portal: an 'admin' role, an active/deactivated status, and admin-only access rules.

-- 1. Allow the admin role and add the status column --------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('student', 'lecturer', 'admin'));

alter table public.profiles
  add column if not exists is_active boolean not null default true;

-- 2. Helper: is the signed-in user an active admin? --------------------------------------
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.is_active
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- 3. Deactivated users lose access to academic data --------------------------------------
-- Same helpers as the first migration, plus "and p.is_active" so the status is enforced by
-- the database, not just hidden in the UI. Deactivated users can still read their own
-- profile row, which is how the app can tell them their account is deactivated.
create or replace function private.lecturer_can_access_module(target_module_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.lecturer_modules lm
    join public.profiles p on p.id = lm.lecturer_id
    where lm.lecturer_id = (select auth.uid())
      and lm.module_id = target_module_id
      and p.role = 'lecturer'
      and p.is_active
  );
$$;

create or replace function private.student_is_enrolled(target_module_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.profiles p on p.id = e.student_id
    where e.student_id = (select auth.uid())
      and e.module_id = target_module_id
      and p.role = 'student'
      and p.is_active
  );
$$;

create or replace function private.lecturer_can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.lecturer_modules lm on lm.module_id = e.module_id
    join public.profiles p on p.id = lm.lecturer_id
    join public.profiles student_profile on student_profile.id = e.student_id
    where lm.lecturer_id = (select auth.uid())
      and e.student_id = target_student_id
      and p.role = 'lecturer'
      and p.is_active
      and student_profile.role = 'student'
      and student_profile.is_active
  );
$$;

create or replace function private.lecturer_can_manage_result(target_student_id uuid, target_assessment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.assessments a
    join public.lecturer_modules lm on lm.module_id = a.module_id
    join public.enrollments e on e.module_id = a.module_id
    join public.profiles p on p.id = lm.lecturer_id
    join public.profiles student_profile on student_profile.id = e.student_id
    where a.id = target_assessment_id
      and e.student_id = target_student_id
      and lm.lecturer_id = (select auth.uid())
      and p.role = 'lecturer'
      and p.is_active
      and student_profile.role = 'student'
      and student_profile.is_active
  );
$$;

-- A user's own enrollment / teaching-assignment rows are also hidden once deactivated.
create or replace function private.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active
  );
$$;

revoke all on function private.is_active_user() from public, anon;
grant execute on function private.is_active_user() to authenticated;

drop policy "Students read their enrollments" on public.enrollments;
create policy "Students read their enrollments"
on public.enrollments for select to authenticated
using (student_id = (select auth.uid()) and (select private.is_active_user()));

drop policy "Lecturers read their module assignments" on public.lecturer_modules;
create policy "Lecturers read their module assignments"
on public.lecturer_modules for select to authenticated
using (lecturer_id = (select auth.uid()) and (select private.is_active_user()));

-- 4. What admins may read and change -----------------------------------------------------
create policy "Admins read all profiles"
on public.profiles for select to authenticated
using ((select private.is_admin()));

-- Admins can only flip is_active (column-level grant), and only on student/lecturer rows,
-- so an admin can neither lock themselves out nor change anyone's role or name.
grant update (is_active) on public.profiles to authenticated;

create policy "Admins update student and lecturer status"
on public.profiles for update to authenticated
using ((select private.is_admin()) and role in ('student', 'lecturer'))
with check ((select private.is_admin()) and role in ('student', 'lecturer'));

create policy "Admins read modules"
on public.modules for select to authenticated
using ((select private.is_admin()));

create policy "Admins read enrollments"
on public.enrollments for select to authenticated
using ((select private.is_admin()));

create policy "Admins read lecturer assignments"
on public.lecturer_modules for select to authenticated
using ((select private.is_admin()));

-- 5. User directory for the admin pages (adds the email from auth.users) -----------------
create or replace function public.admin_list_users(target_id uuid default null)
returns table (
  id uuid,
  full_name text,
  role text,
  gender text,
  institutional_id text,
  is_active boolean,
  email text,
  last_sign_in_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.full_name, p.role, p.gender, p.institutional_id, p.is_active,
         u.email::text, u.last_sign_in_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where (select private.is_admin())
    and p.role in ('student', 'lecturer')
    and (target_id is null or p.id = target_id)
  order by p.full_name;
$$;

revoke all on function public.admin_list_users(uuid) from public, anon;
grant execute on function public.admin_list_users(uuid) to authenticated;
