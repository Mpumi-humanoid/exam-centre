import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, profile, loading } = useAuth()

  if (loading) return <p className="center-msg">Loading…</p>
  if (!user) return <Navigate to="/login" replace />

  if (profile?.role === 'student') return <Navigate to="/student" replace />
  if (profile?.role === 'lecturer') return <Navigate to="/lecturer" replace />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />

  return <p className="center-msg">Setting up your account…</p>
}
