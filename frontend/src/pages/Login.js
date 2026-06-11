import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
      toast.success('Welcome back! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="fade-in">
        <div style={styles.header}>
          <h1 style={styles.logo}>PlacePro</h1>
          <p style={styles.tagline}>Your Placement Preparation Partner</p>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to continue your prep journey</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>
        </form>

        <p style={styles.link}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)' }}>Register here</Link>
        </p>

        <div style={styles.demo}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Demo Credentials</p>
          <button className="btn btn-secondary btn-sm" onClick={() => setForm({ email: 'student@demo.com', password: 'demo123' })}>
            Student Demo
          </button>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => setForm({ email: 'admin@demo.com', password: 'admin123' })}>
            Admin Demo
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)',
    backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 60%)'
  },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    padding: '40px', width: '90%', maxWidth: '440px'
  },
  header: { textAlign: 'center', marginBottom: 28 },
  logo: { fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  tagline: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 },
  link: { textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 20 },
  demo: { marginTop: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }
};
