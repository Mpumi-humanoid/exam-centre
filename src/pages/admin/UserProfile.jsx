import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/RemoteState';
import useRemoteData from '../../hooks/useRemoteData';
import { fetchLecturerModules, fetchStudentModules } from '../../lib/academicData';
import { ROLE_LABELS, fetchManagedUsers } from '../../lib/adminData';
import { StatusBadge, StatusButton } from './shared';

const formatGender = (value) => (value ? value.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) : 'Not provided');
const formatDate = (value) => (value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Never');

export default function UserProfile() {
  const { userId } = useParams();
  const [statusOverride, setStatusOverride] = useState(null);

  const loadData = useCallback(async () => {
    const [person] = await fetchManagedUsers(userId);
    if (!person) throw Object.assign(new Error('User not found.'), { code: 'PGRST116' });
    const modules = person.role === 'lecturer' ? await fetchLecturerModules(person.id) : await fetchStudentModules(person.id);
    return { person, modules };
  }, [userId]);
  const { data, loading, error, refresh } = useRemoteData(loadData);

  const back = <Link to="/admin/users" className="mb-6 inline-block text-sm font-medium text-emerald-800 hover:underline">← All users</Link>;
  if (loading) return <div>{back}<LoadingState message="Loading profile…" /></div>;
  if (error) return <div>{back}<ErrorState message={error} onRetry={refresh} /></div>;

  const { person, modules } = data;
  const isLecturer = person.role === 'lecturer';
  const active = statusOverride ?? person.is_active;
  const roleLabel = ROLE_LABELS[person.role] || person.role;
  const initials = person.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const details = [
    ['Full name', person.full_name],
    ['Gender', formatGender(person.gender)],
    [isLecturer ? 'Staff ID' : 'Student ID', person.institutional_id || 'Not assigned'],
    ['Email address', person.email || 'Not available'],
    ['Account role', roleLabel],
    ['Last sign-in', formatDate(person.last_sign_in_at)],
    ['Account ID', person.id],
  ];

  return (
    <div>
      {back}
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-800">Administration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{roleLabel} profile</h1>
        <p className="mt-2 text-slate-500">Account details and {isLecturer ? 'teaching assignments' : 'module enrolments'}.</p>
      </div>

      <section className="max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-4 bg-[#f4f6f1] px-6 py-7">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 text-lg font-semibold text-white">{initials}</span>
          <div>
            <h2 className="text-xl font-semibold">{person.full_name}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">{roleLabel} account <StatusBadge active={active} /></div>
          </div>
          <div className="ml-auto"><StatusButton person={{ ...person, is_active: active }} onChanged={(_id, nextActive) => setStatusOverride(nextActive)} /></div>
        </div>
        {!active && (
          <p className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-900" role="status">This account is deactivated. The user cannot access the portal until it is reactivated.</p>
        )}
        <dl className="divide-y divide-slate-100 px-6">
          {details.map(([label, value]) => (
            <div key={label} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="break-all text-sm font-medium text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-slate-100 px-6 py-5">
          <h3 className="font-semibold">{isLecturer ? 'Assigned modules' : 'Enrolled modules'}</h3>
          {modules.length
            ? <ul className="mt-3 flex flex-wrap gap-2">{modules.map((module) => <li key={module.id} className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900">{module.code} · {module.name}</li>)}</ul>
            : <div className="mt-4"><EmptyState title={isLecturer ? 'No modules assigned' : 'No module enrolments'} /></div>}
        </div>
      </section>
    </div>
  );
}
