create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student', 'lecturer')),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  credits integer not null check (credits > 0)
);

create table public.lecturer_modules (
  lecturer_id uuid not null references public.profiles (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  primary key (lecturer_id, module_id)
);

create table public.enrollments (
  student_id uuid not null references public.profiles (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  primary key (student_id, module_id)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  name text not null,
  type text not null check (type in ('module', 'exam')),
  date date,
  is_released boolean not null default false,
  unique (module_id, name, type)
);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  mark numeric(5, 2) check (mark between 0 and 100),
  feedback text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, assessment_id)
);

create table public.result_history (
  id uuid primary key default gen_random_uuid(),
  result_id uuid references public.results (id) on delete set null,
  student_id uuid not null references public.profiles (id) on delete restrict,
  assessment_id uuid not null references public.assessments (id) on delete restrict,
  old_mark numeric(5, 2),
  new_mark numeric(5, 2),
  old_feedback text,
  new_feedback text,
  changed_by uuid references public.profiles (id) on delete set null,
  changed_at timestamptz not null default now()
);

create index enrollments_module_id_idx on public.enrollments (module_id);
create index lecturer_modules_module_id_idx on public.lecturer_modules (module_id);
create index assessments_module_id_idx on public.assessments (module_id);
create index results_assessment_id_idx on public.results (assessment_id);
create index results_updated_by_idx on public.results (updated_by);
create index result_history_assessment_id_idx on public.result_history (assessment_id);

create function private.lecturer_can_access_module(target_module_id uuid)
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
  );
$$;

create function private.student_is_enrolled(target_module_id uuid)
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
  );
$$;

create function private.lecturer_can_access_student(target_student_id uuid)
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
      and student_profile.role = 'student'
  );
$$;

create function private.lecturer_can_manage_result(target_student_id uuid, target_assessment_id uuid)
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
      and student_profile.role = 'student'
  );
$$;

create function public.prepare_result_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

create function public.log_result_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  insert into public.result_history (
    result_id,
    student_id,
    assessment_id,
    old_mark,
    new_mark,
    old_feedback,
    new_feedback,
    changed_by
  ) values (
    new.id,
    new.student_id,
    new.assessment_id,
    case when tg_op = 'UPDATE' then old.mark else null end,
    new.mark,
    case when tg_op = 'UPDATE' then old.feedback else null end,
    new.feedback,
    (select auth.uid())
  );
  return null;
end;
$$;

create trigger results_prepare_change
before insert or update on public.results
for each row execute function public.prepare_result_change();

create trigger results_log_change
after insert or update on public.results
for each row execute function public.log_result_change();

alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lecturer_modules enable row level security;
alter table public.enrollments enable row level security;
alter table public.assessments enable row level security;
alter table public.results enable row level security;
alter table public.result_history enable row level security;

revoke all on public.profiles, public.modules, public.lecturer_modules, public.enrollments,
  public.assessments, public.results, public.result_history from anon, authenticated;
grant select on public.profiles to authenticated;
grant select, update on public.modules to authenticated;
grant select on public.lecturer_modules, public.enrollments to authenticated;
grant select, insert, update, delete on public.assessments to authenticated;
grant select, insert, update on public.results to authenticated;
grant select on public.result_history to authenticated;

revoke all on function private.lecturer_can_access_module(uuid) from public, anon;
revoke all on function private.student_is_enrolled(uuid) from public, anon;
revoke all on function private.lecturer_can_access_student(uuid) from public, anon;
revoke all on function private.lecturer_can_manage_result(uuid, uuid) from public, anon;
revoke all on function public.prepare_result_change() from public, anon, authenticated;
revoke all on function public.log_result_change() from public, anon, authenticated;
grant execute on function private.lecturer_can_access_module(uuid) to authenticated;
grant execute on function private.student_is_enrolled(uuid) to authenticated;
grant execute on function private.lecturer_can_access_student(uuid) to authenticated;
grant execute on function private.lecturer_can_manage_result(uuid, uuid) to authenticated;

create policy "Users read own profile"
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy "Lecturers read enrolled student profiles"
on public.profiles for select to authenticated
using (role = 'student' and (select private.lecturer_can_access_student(id)));

create policy "Students read enrolled modules"
on public.modules for select to authenticated
using ((select private.student_is_enrolled(id)));

create policy "Lecturers read assigned modules"
on public.modules for select to authenticated
using ((select private.lecturer_can_access_module(id)));

create policy "Lecturers update assigned modules"
on public.modules for update to authenticated
using ((select private.lecturer_can_access_module(id)))
with check ((select private.lecturer_can_access_module(id)));

create policy "Lecturers read their module assignments"
on public.lecturer_modules for select to authenticated
using (lecturer_id = (select auth.uid()));

create policy "Students read their enrollments"
on public.enrollments for select to authenticated
using (student_id = (select auth.uid()));

create policy "Lecturers read enrollments for assigned modules"
on public.enrollments for select to authenticated
using ((select private.lecturer_can_access_module(module_id)));

create policy "Students read assessments for enrolled modules"
on public.assessments for select to authenticated
using ((select private.student_is_enrolled(module_id)));

create policy "Lecturers manage assessments for assigned modules"
on public.assessments for all to authenticated
using ((select private.lecturer_can_access_module(module_id)))
with check ((select private.lecturer_can_access_module(module_id)));

create policy "Students read own released results"
on public.results for select to authenticated
using (
  student_id = (select auth.uid())
  and exists (
    select 1
    from public.assessments a
    where a.id = results.assessment_id
      and a.is_released
      and (select private.student_is_enrolled(a.module_id))
  )
);

create policy "Lecturers read results for assigned modules"
on public.results for select to authenticated
using (
  (select private.lecturer_can_manage_result(student_id, assessment_id))
);

create policy "Lecturers insert results for assigned modules"
on public.results for insert to authenticated
with check (
  updated_by = (select auth.uid())
  and (select private.lecturer_can_manage_result(student_id, assessment_id))
);

create policy "Lecturers update results for assigned modules"
on public.results for update to authenticated
using (
  (select private.lecturer_can_manage_result(student_id, assessment_id))
)
with check (
  updated_by = (select auth.uid())
  and (select private.lecturer_can_manage_result(student_id, assessment_id))
);

create policy "Lecturers read history for assigned modules"
on public.result_history for select to authenticated
using (
  exists (
    select 1
    from public.assessments a
    where a.id = result_history.assessment_id
      and (select private.lecturer_can_access_module(a.module_id))
  )
);
