import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

const DEMO_PASSWORD = 'Password123!';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@brightfield.edu' },
  { role: 'Teacher', email: 'teacher@brightfield.edu' },
  { role: 'Parent', email: 'parent@brightfield.edu' },
] as const;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function doLogin(loginEmail: string, loginPassword: string) {
    setError(null);
    setLoading(true);
    try {
      const authUser = await login(loginEmail, loginPassword);
      navigate(authUser.role === 'Admin' ? '/dashboard' : '/announcements');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await doLogin(email, password);
  }

  async function handleDemoLogin(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    await doLogin(demoEmail, DEMO_PASSWORD);
  }

  return (
    <div className="login-shell">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h2>Parent-School Hub</h2>

        <p className="muted" style={{ marginBottom: 8 }}>Log in as:</p>
        <div className="row" style={{ marginBottom: 16 }}>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              className="secondary"
              disabled={loading}
              onClick={() => handleDemoLogin(account.email)}
              style={{ flex: 1 }}
            >
              {account.role}
            </button>
          ))}
        </div>

        <p className="muted" style={{ marginBottom: 16 }}>Or sign in manually:</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
