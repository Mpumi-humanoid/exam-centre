import { useCallback } from 'react';
import { useAuth } from '../../auth/useAuth';
import { EmptyState, ErrorState, LoadingState } from '../../components/RemoteState';
import useRemoteData from '../../hooks/useRemoteData';
import { fetchLecturerModules, fetchProfile } from '../../lib/academicData';

export default function LecturerProfile() {
  const { user } = useAuth();
  const loadData = useCallback(async () => {
    const [profile, modules] = await Promise.all([fetchProfile(user.id), fetchLecturerModules(user.id)]);
    return { profile, modules };
  }, [user.id]);
  const { data, loading, error, refresh } = useRemoteData(loadData);

  if (loading) return <LoadingState message="Loading your lecturer profile…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const { profile, modules } = data;
  const name = profile.full_name;
  const details = [
    ['Full name', name],
    ['Gender', profile.gender || 'Not provided'],
    ['Staff ID', profile.institutional_id || 'Not assigned'],
    ['Email address', user.email || 'Not available'],
    ['Account role', 'Lecturer'],
    ['Account ID', user.id],
  ];

  return (
    <div>
      <div className="mb-8"><p className="text-sm font-medium text-emerald-800">Your account</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Lecturer profile</h1><p className="mt-2 text-slate-500">Your verified staff account and assigned modules.</p></div>
      <section className="max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-4 bg-[#f4f6f1] px-6 py-7">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 text-lg font-semibold text-white">{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
          <div><h2 className="text-xl font-semibold">{name}</h2><p className="mt-1 text-sm text-slate-500">Lecturer account</p></div>
        </div>
        <dl className="divide-y divide-slate-100 px-6">
          {details.map(([label, value]) => <div key={label} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-4"><dt className="text-sm text-slate-500">{label}</dt><dd className="break-all text-sm font-medium text-slate-800">{value}</dd></div>)}
        </dl>
        <div className="border-t border-slate-100 px-6 py-5">
          <h3 className="font-semibold">Assigned modules</h3>
          {modules.length
            ? <ul className="mt-3 flex flex-wrap gap-2">{modules.map((module) => <li key={module.id} className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900">{module.code} · {module.name}</li>)}</ul>
            : <div className="mt-4"><EmptyState title="No modules assigned" description="Contact an administrator if you expected teaching assignments." /></div>}
        </div>
      </section>
    </div>
  );
}
