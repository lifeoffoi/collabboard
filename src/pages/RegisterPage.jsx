import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('user');
  const { register, status, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await register(name, email, password, role);
    if (ok) navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create an account</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="password" />
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={status === 'loading'} className="btn-primary full-width">
            {status === 'loading' ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">Have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
