import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { describeAuthError } from '../auth/profile';

export default function Login({ onLogin }) {
  const { signIn, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { profile } = await signIn(email.trim(), password);
      onLogin(profile);
    } catch (signInError) {
      console.error('Sign in failed:', signInError);
      setError(describeAuthError(signInError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-md bg-emerald-800 text-white flex items-center justify-center font-display text-lg font-semibold">E</div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-900">Exam Centre</span>
            <span className="text-xs text-gray-500">secure sign in</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-medium text-emerald-800 mb-1">Student and lecturer access</p>
          <h1 className="font-display text-3xl font-medium text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with your institution email. Your account role determines which portal opens.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@institution.edu" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter your password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700" />
          </div>

          {(error || authError) && <div className="text-sm text-red-700 bg-red-50 p-3 rounded" role="alert">{error || authError}</div>}

          <button type="submit" disabled={loading} className="w-full bg-emerald-900 text-white py-2 px-4 rounded-md hover:bg-emerald-950 disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-gray-500 hover:text-gray-700">← Back to welcome page</Link>
        </p>
      </div>
    </div>
  );
}
