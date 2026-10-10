import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/RemoteState';
import useRemoteData from '../../hooks/useRemoteData';
import { ROLE_LABELS, fetchManagedUsers } from '../../lib/adminData';
import { StatusBadge, StatusButton } from './shared';

const FILTERS = [['all', 'All'], ['student', 'Students'], ['lecturer', 'Lecturers']];

export default function Users() {
  const loadData = useCallback(() => fetchManagedUsers(), []);
  const { data: users, loading, error, refresh } = useRemoteData(loadData);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  // Status changes made on this page, so the list updates without a full reload.
  const [changes, setChanges] = useState({});

  const people = useMemo(
    () => (users || []).map((person) => (person.id in changes ? { ...person, is_active: changes[person.id] } : person)),
    [users, changes],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return people.filter((person) => {
      if (filter !== 'all' && person.role !== filter) return false;
      if (!term) return true;
      return [person.full_name, person.email, person.institutional_id].some((value) => (value || '').toLowerCase().includes(term));
    });
  }, [people, filter, search]);

  const activeCount = people.filter((person) => person.is_active).length;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-800">Administration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Manage users</h1>
        <p className="mt-2 text-slate-500">View student and lecturer profiles, and activate or deactivate their accounts.</p>
      </div>

      {loading && <LoadingState message="Loading users…" />}
      {error && <ErrorState message={error} onRetry={refresh} />}

      {!loading && !error && (
        <>
          <p className="mb-4 text-sm text-slate-500">{people.length} users · {activeCount} active · {people.length - activeCount} deactivated</p>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex gap-1" role="group" aria-label="Filter by role">
              {FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={`rounded-lg px-3 py-2 text-sm ${filter === value ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or ID"
              aria-label="Search users"
              className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 sm:ml-auto"
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState title="No users found" description="Try a different filter or search term." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-[#f4f6f1] text-slate-500">
                  <tr>
                    {['Name', 'Role', 'ID', 'Email', 'Status', ''].map((heading) => <th key={heading || 'actions'} className="px-4 py-3 font-medium">{heading}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((person) => (
                    <tr key={person.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-900">{person.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[person.role] || person.role}</td>
                      <td className="px-4 py-3 text-slate-600">{person.institutional_id || '—'}</td>
                      <td className="break-all px-4 py-3 text-slate-600">{person.email || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge active={person.is_active} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-start justify-end gap-3">
                          <Link to={`/admin/users/${person.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">View profile</Link>
                          <StatusButton person={person} onChanged={(id, active) => setChanges((current) => ({ ...current, [id]: active }))} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
