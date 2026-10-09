import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import Layout from './components/Layout';
import { LoadingState, ErrorState } from './components/RemoteState';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/student/Dashboard';
import Feedback from './pages/student/Feedback';
import Modules from './pages/student/Modules';
import Profile from './pages/student/Profile';
import Results from './pages/student/Results';
import LecturerProfile from './pages/lecturer/Profile';
import ManageResults from './pages/lecturer/ManageResults';

function getPortalPath(role) {
  if (role === 'student') return '/student';
  if (role === 'lecturer') return '/lecturer/results';
  return null;
}

function SessionProblem({ message }) {
  const { signOut } = useAuth();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <ErrorState message={message || 'Your account profile is not available. Please sign out and try again.'} />
      <button type="button" onClick={() => signOut().catch((error) => console.error('Sign out failed:', error))} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Sign out
      </button>
    </main>
  );
}

function Protected({ role, children }) {
  const { session, profile, initializing, profileLoading, error } = useAuth();
  if (initializing || (session && !profile && profileLoading)) {
    return <main className="mx-auto max-w-3xl p-8"><LoadingState message="Checking your account…" /></main>;
  }
  if (!session) return <Navigate to="/login" replace />;
  if (!profile) return <SessionProblem message={error} />;
  if (profile.role !== role) {
    const portalPath = getPortalPath(profile.role);
    return portalPath ? <Navigate to={portalPath} replace /> : <SessionProblem message="Your account does not have a supported portal role." />;
  }
  return <Layout role={role}>{children}</Layout>;
}

function LoginPage() {
  const navigate = useNavigate();
  return <Login onLogin={(profile) => navigate(getPortalPath(profile.role), { replace: true })} />;
}

function AppRoutes() {
  const { profile, initializing } = useAuth();
  if (initializing) return <main className="mx-auto max-w-3xl p-8"><LoadingState message="Restoring your session…" /></main>;
  // Only send people to a portal once we know their role. Until then, public pages stay usable.
  const portalPath = getPortalPath(profile?.role);
  return (
    <Routes>
      <Route path="/" element={portalPath ? <Navigate to={portalPath} replace /> : <Home />} />
      <Route path="/login" element={portalPath ? <Navigate to={portalPath} replace /> : <LoginPage />} />
      <Route path="/student" element={<Protected role="student"><Dashboard /></Protected>} />
      <Route path="/results" element={<Protected role="student"><Results /></Protected>} />
      <Route path="/modules" element={<Protected role="student"><Modules /></Protected>} />
      <Route path="/feedback" element={<Protected role="student"><Feedback /></Protected>} />
      <Route path="/profile" element={<Protected role="student"><Profile /></Protected>} />
      <Route path="/lecturer/results" element={<Protected role="lecturer"><ManageResults /></Protected>} />
      <Route path="/lecturer/profile" element={<Protected role="lecturer"><LecturerProfile /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
