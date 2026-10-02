import { NavLink, useNavigate } from 'react-router-dom';
import { btnGhost } from './ui';

const NAV = {
  student: { sub: 'student portal', links: [['/', 'Welcome page'], ['/results', 'Results'], ['/profile', 'Profile']] },
  admin: { sub: 'admin console', links: [['/', 'Welcome page'], ['/admin', 'All results'], ['/admin/analytics', 'Class averages'], ['/admin/profile', 'Profile']] },
};

export default function Layout({ role, session, children }) {
  const navigate = useNavigate();
  const { sub, links } = NAV[role];

  function logout() {
    sessionStorage.removeItem('session');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-gray-900 text-white flex items-center justify-center font-display font-semibold">R</div>
            <div className="leading-tight">
              <div className="font-semibold text-gray-900">Result Center</div>
              <div className="text-xs text-gray-500">{sub}</div>
            </div>
          </div>
          <nav className="flex gap-4 text-sm md:ml-6" aria-label="Main navigation">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-800')}>{label}</NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-600">{session?.username}</span>
            <button onClick={logout} className={btnGhost}>Log out</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-10">
        {children}
        <footer className="text-xs text-gray-400 border-t pt-4">Result Center</footer>
      </main>
    </div>
  );
}
