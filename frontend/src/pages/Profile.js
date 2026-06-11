import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '', college: user?.college || '', department: user?.department || '',
    year: user?.year || 1, bio: user?.bio || '', skills: user?.skills?.join(', ') || '',
    linkedIn: user?.linkedIn || '', github: user?.github || ''
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
      const { data } = await axios.put('/api/auth/profile', payload);
      updateUser(data);
      toast.success('Profile updated!');
    } catch (e) { toast.error('Update failed'); }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await axios.put('/api/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSavingPw(false);
  };

  const accuracy = user?.aptitudeStats?.totalAttempted > 0
    ? Math.round((user.aptitudeStats.totalCorrect / user.aptitudeStats.totalAttempted) * 100)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h2>👤 Profile</h2>
        <p>Manage your account and preferences</p>
      </div>

      <div className="page-body">
        {/* Profile header card */}
        <div className="card fade-in" style={{ marginBottom: 24, padding: '28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>{user?.email}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {user?.college && <span className="chip chip-info">🏫 {user.college}</span>}
                {user?.department && <span className="chip chip-purple">{user.department}</span>}
                {user?.year && <span className="chip chip-medium">Year {user.year}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Points', value: user?.totalPoints || 0, icon: '⭐' },
                { label: 'Solved', value: user?.codingStats?.totalSolved || 0, icon: '✅' },
                { label: 'Streak', value: user?.streak || 0, icon: '🔥' },
                { label: 'Accuracy', value: accuracy + '%', icon: '🎯' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {user?.bio && <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: 14 }}>{user.bio}</p>}
        </div>

        <div className="tabs fade-in">
          {['profile', 'security', 'badges'].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'profile' ? '✏️ Edit Profile' : t === 'security' ? '🔒 Security' : '🏅 Badges'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="card fade-in">
            <div className="card-header"><span className="card-title">Edit Profile</span></div>
            <form onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Full Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">College</label>
                  <input className="input" placeholder="Your college name" value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Department</label>
                  <input className="input" placeholder="CSE, ECE, IT..." value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Year</label>
                  <select className="input" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ height: 16 }} />
              <div className="input-group">
                <label className="input-label">Bio</label>
                <textarea className="input" rows={3} placeholder="Tell something about yourself..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="input-group">
                <label className="input-label">Skills (comma separated)</label>
                <input className="input" placeholder="Java, Python, React, SQL..." value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">LinkedIn URL</label>
                  <input className="input" placeholder="https://linkedin.com/in/..." value={form.linkedIn} onChange={e => setForm({ ...form, linkedIn: e.target.value })} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">GitHub URL</label>
                  <input className="input" placeholder="https://github.com/..." value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
                </div>
              </div>
              <div style={{ height: 20 }} />
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Changes'}</button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card fade-in">
            <div className="card-header"><span className="card-title">Change Password</span></div>
            <form onSubmit={handlePasswordChange} style={{ maxWidth: 420 }}>
              <div className="input-group">
                <label className="input-label">Current Password</label>
                <input type="password" className="input" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">New Password</label>
                <input type="password" className="input" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input type="password" className="input" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPw}>{savingPw ? '⏳ Updating...' : '🔒 Change Password'}</button>
            </form>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="card fade-in">
            <div className="card-header"><span className="card-title">My Badges</span></div>
            {user?.badges?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {user.badges.map((b, i) => (
                  <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>{b.icon || '🏅'}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{new Date(b.earnedAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="icon">🏅</div>
                <h3>No badges yet</h3>
                <p>Solve problems, take tests, and maintain streaks to earn badges!</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                  {['🔥 7-Day Streak', '💻 10 Problems', '🧠 First Test', '⭐ 100 Points'].map(b => (
                    <span key={b} style={{ padding: '8px 14px', background: 'var(--bg-secondary)', borderRadius: 20, fontSize: 13, color: 'var(--text-muted)', border: '1px dashed var(--border-light)' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
