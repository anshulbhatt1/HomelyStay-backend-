import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <h2>Create an account</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="name">
            Name
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="role">
            Account type
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="user">Guest</option>
              <option value="host">Host</option>
            </select>
          </label>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

