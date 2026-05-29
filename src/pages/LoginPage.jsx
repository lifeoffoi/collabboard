import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, status, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign in to CollabBoard</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="password" />
          <button type="submit" disabled={status === 'loading'} className="btn-primary full-width">
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
