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

function Protected({ role, children }) {
  const { session, profile, loading, error } = useAuth();
  if (loading) return <main className="mx-auto max-w-3xl p-8"><LoadingState message="Checking your account…" /></main>;
  if (!session) return <Navigate to="/login" replace />;
  if (error || !profile) return <main className="mx-auto max-w-3xl p-8"><ErrorState message={error || 'Your account profile is not available. Contact an administrator.'} /></main>;
  if (profile.role !== role) return <Navigate to={profile.role === 'lecturer' ? '/lecturer/results' : '/student'} replace />;
  return <Layout role={role}>{children}</Layout>;
}

function LoginPage() {
  const navigate = useNavigate();
  return <Login onLogin={(profile) => navigate(profile.role === 'lecturer' ? '/lecturer/results' : '/student')} />;
}

function AppRoutes() {
  const { session, profile, loading } = useAuth();
  if (loading) return <main className="mx-auto max-w-3xl p-8"><LoadingState message="Restoring your session…" /></main>;
  return (
    <Routes>
      <Route path="/" element={session && profile ? <Navigate to={profile.role === 'lecturer' ? '/lecturer/results' : '/student'} replace /> : <Home />} />
      <Route path="/login" element={session && profile ? <Navigate to={profile.role === 'lecturer' ? '/lecturer/results' : '/student'} replace /> : <LoginPage />} />
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
