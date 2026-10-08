import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { EmptyState, ErrorState, LoadingState } from '../../components/RemoteState';
import useRemoteData from '../../hooks/useRemoteData';
import { fetchStudentModules, fetchStudentResults } from '../../lib/academicData';

function Stat({ label, value, note }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </article>
  );
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const loadData = useCallback(async () => {
    const [modules, results] = await Promise.all([fetchStudentModules(user.id), fetchStudentResults(user.id)]);
    return { modules, results };
  }, [user.id]);
  const { data, loading, error, refresh } = useRemoteData(loadData);

  if (loading) return <LoadingState message="Loading your academic overview…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const { modules, results } = data;
  const markedResults = results.filter((result) => result.mark !== null);
  const average = markedResults.length ? Math.round(markedResults.reduce((total, result) => total + Number(result.mark), 0) / markedResults.length) : '—';
  const recentResults = results.slice(0, 4);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-800">{new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(new Date())}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1>
          <p className="mt-2 text-slate-500">Here is how your studies are going.</p>
        </div>
        <Link to="/profile" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">View my profile</Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Academic summary">
        <Stat label="Current average" value={average === '—' ? average : `${average}%`} note="Across released results" />
        <Stat label="Modules" value={modules.length} note="Currently enrolled" />
        <Stat label="Results released" value={results.length} note="Available to view" />
        <Stat label="Feedback received" value={results.filter((result) => result.feedback).length} note="For released results" />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div><h2 className="font-semibold">Recent results</h2><p className="mt-1 text-xs text-slate-500">Your latest released assessment results</p></div>
            <Link to="/results" className="text-sm font-medium text-emerald-800 hover:underline">All results</Link>
          </div>
          {recentResults.length ? (
            <div className="divide-y divide-slate-100">
              {recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{result.assessment}</p><p className="mt-1 text-xs text-slate-500">{result.code} · {result.module}</p></div>
                  <div className="shrink-0 text-right"><span className={`text-lg font-semibold ${result.mark === null ? 'text-slate-400' : result.mark >= 75 ? 'text-emerald-800' : 'text-amber-700'}`}>{result.mark === null ? '—' : `${result.mark}%`}</span><p className="mt-1 text-xs text-slate-400">{result.date || 'Date not set'}</p></div>
                </div>
              ))}
            </div>
          ) : <div className="p-5"><EmptyState title="No results released yet" description="Your results will appear here after your lecturers publish them." /></div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div><h2 className="font-semibold">My modules</h2><p className="mt-1 text-xs text-slate-500">{modules.length > 4 ? `Showing 4 of ${modules.length} enrolled modules` : 'Your current enrolments'}</p></div>
            <Link to="/modules" className="text-sm font-medium text-emerald-800 hover:underline">View all</Link>
          </div>
          {modules.length ? (
            <div className="mt-5 space-y-5">
              {modules.slice(0, 4).map((module) => {
                const marks = results.filter((result) => result.moduleId === module.id && result.mark !== null).map((result) => Number(result.mark));
                const mark = marks.length ? Math.round(marks.reduce((total, value) => total + value, 0) / marks.length) : null;
                return (
                  <div key={module.id}>
                    <div className="flex items-center justify-between gap-3 text-sm"><span className="font-medium">{module.name}</span><span className="font-semibold text-slate-700">{mark === null ? '—' : `${mark}%`}</span></div>
                    <p className="mt-1 text-xs text-slate-400">{module.code} · {module.credits} credits</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${mark >= 75 ? 'bg-emerald-700' : 'bg-amber-500'}`} style={{ width: `${mark || 0}%` }} /></div>
                  </div>
                );
              })}
            </div>
          ) : <div className="mt-5"><EmptyState title="No modules yet" description="Your current module enrolments will appear here." /></div>}
        </section>
      </div>

      <Link to="/feedback" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-900 px-6 py-5 text-white transition hover:bg-emerald-950">
        <div><p className="font-semibold">Feedback helps you move forward</p><p className="mt-1 text-sm text-emerald-100">Review lecturer comments and plan what to focus on next.</p></div>
        <span className="text-sm font-semibold">Read feedback <span aria-hidden="true">→</span></span>
      </Link>
    </div>
  );
}
