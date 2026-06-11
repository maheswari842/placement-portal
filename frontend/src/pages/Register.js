import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', department: '', year: 1 });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
      toast.success('Account created! Welcome to PlacePro 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="fade-in">
        <div style={styles.header}>
          <h1 style={styles.logo}>PlacePro</h1>
          <p style={styles.tagline}>Start your placement journey today</p>
        </div>

        <h2 style={styles.title}>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Full Name *</label>
              <input className="input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Email *</label>
              <input type="email" className="input" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div style={{ height: 12 }} />

          <div className="input-group">
            <label className="input-label">Password *</label>
            <input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <div className="input-group">
            <label className="input-label">College</label>
            <input className="input" placeholder="Your college name" value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Department</label>
              <input className="input" placeholder="CSE, ECE..." value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Year</label>
              <select className="input" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}>
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y} Year</option>)}
              </select>
            </div>
          </div>
          <div style={{ height: 16 }} />

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Creating...' : '✨ Create Account'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)',
    backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)',
    padding: '20px'
  },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    padding: '36px', width: '100%', maxWidth: '480px'
  },
  header: { textAlign: 'center', marginBottom: 24 },
  logo: { fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  tagline: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 20 },
  link: { textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 20 }
};
