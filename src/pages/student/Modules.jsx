import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { EmptyState, ErrorState, LoadingState } from '../../components/RemoteState';
import useRemoteData from '../../hooks/useRemoteData';
import { fetchStudentModules, fetchStudentResults } from '../../lib/academicData';

export default function Modules() {
  const { user } = useAuth();
  const loadData = useCallback(async () => {
    const [modules, results] = await Promise.all([fetchStudentModules(user.id), fetchStudentResults(user.id)]);
    return { modules, results };
  }, [user.id]);
  const { data, loading, error, refresh } = useRemoteData(loadData);

  if (loading) return <LoadingState message="Loading your modules…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const { modules, results } = data;
  if (!modules.length) return <div><PageTitle /><EmptyState title="No modules found" description="You are not enrolled in any modules yet. Contact student administration if this looks wrong." /></div>;

  return (
    <div>
      <PageTitle />
      <div className="mb-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">{modules.length} enrolled modules</span>
        <span className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">{modules.reduce((total, module) => total + module.credits, 0)} total credits</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => {
          const marks = results.filter((result) => result.moduleId === module.id && result.mark !== null).map((result) => Number(result.mark));
          const mark = marks.length ? Math.round(marks.reduce((total, value) => total + value, 0) / marks.length) : null;
          return (
            <article key={module.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{module.code}</p><h2 className="mt-1 text-lg font-semibold">{module.name}</h2></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">Enrolled</span></div>
              <dl className="mt-5 grid grid-cols-2 gap-y-4 border-t border-slate-100 pt-4 text-sm">
                <div><dt className="text-xs text-slate-500">Credits</dt><dd className="mt-1 font-medium text-slate-800">{module.credits}</dd></div>
                <div><dt className="text-xs text-slate-500">Released results</dt><dd className="mt-1 font-medium text-slate-800">{marks.length}</dd></div>
                <div className="col-span-2"><dt className="text-xs text-slate-500">Current average</dt><dd className={`mt-1 font-semibold ${mark === null ? 'text-slate-400' : mark >= 75 ? 'text-emerald-800' : 'text-amber-700'}`}>{mark === null ? 'No released marks' : `${mark}%`}</dd></div>
              </dl>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${mark >= 75 ? 'bg-emerald-700' : 'bg-amber-500'}`} style={{ width: `${mark || 0}%` }} /></div>
              <Link to="/results" className="mt-4 inline-block text-sm font-medium text-emerald-800 hover:underline">See assessment results <span aria-hidden="true">→</span></Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PageTitle() {
  return (
    <div className="mb-8">
      <p className="text-sm font-medium text-emerald-800">Your enrolment</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">My modules</h1>
      <p className="mt-2 text-slate-500">Your enrolled modules and released result summaries.</p>
    </div>
  );
}
