import React, { useState } from 'react';

export default function Login({ onLoginSuccess, host }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(`${host}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      if (isRegister) {
        setMessage('Registration successful! You can now log in.');
        setIsRegister(false);
        setPassword('');
      } else {
        localStorage.setItem('whyop_token', data.token);
        localStorage.setItem('whyop_user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="ambient-cyan"></div>
      <div className="auth-card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/whyop.gif" alt="why.op logo" style={{ height: '70px', borderRadius: '12px', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }} />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>
              <span style={{
                background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}>
                why.op
              </span>
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem' }}>
            {isRegister ? 'Create a developer account' : 'Access your script protection dashboard'}
          </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '0.875rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '0.875rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <span
            style={{
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'underline'
            }}
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setMessage('');
            }}
          >
            {isRegister ? 'Login' : 'Register now'}
          </span>
        </div>
      </div>
    </div>
  );
}
