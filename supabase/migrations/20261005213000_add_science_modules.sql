insert into public.modules (id, code, name, credits)
values
  ('22100000-0000-4000-8000-000000000001', 'MTHS221', 'Mathematics', 15),
  ('22200000-0000-4000-8000-000000000002', 'STEM221', 'Science, Technology, Engineering and Mathematics', 15),
  ('22300000-0000-4000-8000-000000000003', 'GEO221', 'Geography', 15),
  ('22400000-0000-4000-8000-000000000004', 'PHYS221', 'Physics', 15)
on conflict (code) do nothing;

insert into public.assessments (id, module_id, name, type, date, is_released)
values
  ('22100000-0000-4000-8001-000000000001', '22100000-0000-4000-8000-000000000001', 'Coursework', 'module', null, false),
  ('22100000-0000-4000-8001-000000000002', '22100000-0000-4000-8000-000000000001', 'Final examination', 'exam', null, false),
  ('22200000-0000-4000-8001-000000000001', '22200000-0000-4000-8000-000000000002', 'Coursework', 'module', null, false),
  ('22200000-0000-4000-8001-000000000002', '22200000-0000-4000-8000-000000000002', 'Final examination', 'exam', null, false),
  ('22300000-0000-4000-8001-000000000001', '22300000-0000-4000-8000-000000000003', 'Coursework', 'module', null, false),
  ('22300000-0000-4000-8001-000000000002', '22300000-0000-4000-8000-000000000003', 'Final examination', 'exam', null, false),
  ('22400000-0000-4000-8001-000000000001', '22400000-0000-4000-8000-000000000004', 'Coursework', 'module', null, false),
  ('22400000-0000-4000-8001-000000000002', '22400000-0000-4000-8000-000000000004', 'Final examination', 'exam', null, false)
on conflict (id) do nothing;

insert into public.enrollments (student_id, module_id)
select p.id, m.id
from public.profiles p
join auth.users u on u.id = p.id
cross join public.modules m
where lower(u.email) = lower('max0101@gmail.com')
  and p.role = 'student'
  and m.code in ('MTHS221', 'STEM221', 'GEO221', 'PHYS221')
on conflict do nothing;

insert into public.lecturer_modules (lecturer_id, module_id)
select p.id, m.id
from public.profiles p
join auth.users u on u.id = p.id
cross join public.modules m
where lower(u.email) = lower('pope1212@gmail.com')
  and p.role = 'lecturer'
  and m.code in ('MTHS221', 'STEM221', 'GEO221', 'PHYS221')
on conflict do nothing;
