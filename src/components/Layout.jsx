import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/useAuth';

const NAVIGATION = {
  student: {
    home: '/student',
    subtitle: 'Student portal',
    accountLabel: 'Student account',
    links: [
      ['/student', 'Overview'],
      ['/results', 'Module & exam results'],
      ['/modules', 'My modules'],
      ['/feedback', 'Feedback'],
      ['/profile', 'My profile'],
    ],
  },
  lecturer: {
    home: '/lecturer/results',
    subtitle: 'Lecturer portal',
    accountLabel: 'Lecturer account',
    links: [
      ['/lecturer/results', 'Manage results'],
      ['/lecturer/profile', 'My profile'],
    ],
  },
  admin: {
    home: '/admin/users',
    subtitle: 'Admin portal',
    accountLabel: 'Administrator account',
    links: [
      ['/admin/users', 'Manage users'],
    ],
  },
};

const SECTION_LABELS = { student: 'Your learning', lecturer: 'Teaching', admin: 'Administration' };

export default function Layout({ role = 'student', children }) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const { home, subtitle, accountLabel, links } = NAVIGATION[role];
  const displayName = profile?.full_name || user?.email || accountLabel;
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  async function logout() {
    setLogoutError('');
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
      setLogoutError('Could not sign out. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5] font-sans text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex">
        <a href={home} className="flex items-center gap-3">
          <img src="/logo1.jpg" className="flex h-12 w-12 object-contain" />
          <span>
            <span className="block font-semibold tracking-tight">Exam Centre</span>
            <span className="block text-xs text-slate-500">{subtitle}</span>
          </span>
        </a>
        <p className="mb-3 mt-12 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{SECTION_LABELS[role]}</p>
        <nav className="space-y-1" aria-label={`${role} navigation`}>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm transition ${isActive ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-[#f7f8f5] p-4">
          <p className="text-xs font-semibold text-slate-800">Need help?</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Contact the Exam Centre support desk for help with your account.</p>
          <a className="mt-2 inline-block text-xs font-semibold text-emerald-800 hover:underline" href="mailto:support@examcentre.edu">Contact support</a>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <img src="/logo1.jpg" alt="Exam Centre" className="h-12 w-12 object-contain" />
              <span className="font-semibold">Exam Centre</span>
            </div>
            <nav className="order-3 flex w-full gap-1 overflow-x-auto pb-1 lg:hidden" aria-label={`${role} navigation`}>
              {links.map(([to, label]) => (
                <NavLink key={to} to={to} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-xs ${isActive ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-slate-500">{accountLabel}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-900" aria-hidden="true">{initials}</span>
              <button onClick={logout} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Log out</button>
            </div>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-73px)] max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          {logoutError && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{logoutError}</div>}
          {children}
          <footer className="mt-12 border-t border-slate-200 py-5 text-xs text-slate-400">Exam Centre · Academic records</footer>
        </main>
      </div>
    </div>
  );
}
