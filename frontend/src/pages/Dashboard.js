import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [dailyQ, setDailyQ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, dailyRes] = await Promise.allSettled([
          axios.get('/api/progress'),
          axios.get('/api/coding/daily-challenge')
        ]);
        if (progressRes.status === 'fulfilled') setProgress(progressRes.value.data);
        if (dailyRes.status === 'fulfilled') setDailyQ(dailyRes.value.data);
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const quickStats = [
    { label: 'Total Points', value: user?.totalPoints || 0, icon: '⭐', color: '#f59e0b', change: '+120 this week' },
    { label: 'Problems Solved', value: user?.codingStats?.totalSolved || 0, icon: '✅', color: '#10b981', change: `${user?.codingStats?.easySolved || 0}E/${user?.codingStats?.mediumSolved || 0}M/${user?.codingStats?.hardSolved || 0}H` },
    { label: 'Aptitude Score', value: user?.aptitudeStats?.totalAttempted > 0 ? Math.round((user.aptitudeStats.totalCorrect / user.aptitudeStats.totalAttempted) * 100) + '%' : '0%', icon: '🧠', color: '#6366f1', change: `${user?.aptitudeStats?.totalCorrect || 0} correct` },
    { label: 'Current Streak', value: user?.streak || 0, icon: '🔥', color: '#ef4444', change: 'days in a row' }
  ];

  const shortcuts = [
    { label: 'Take Aptitude Test', icon: '🧠', link: '/aptitude', color: '#6366f1', desc: 'Practice quantitative & logical reasoning' },
    { label: 'Solve Coding Problem', icon: '💻', link: '/coding', color: '#10b981', desc: 'DS&A, algorithms, and more' },
    { label: "Today's Challenge", icon: '⚡', link: '/daily-challenge', color: '#f59e0b', desc: 'Special problem of the day' },
    { label: 'View Leaderboard', icon: '🏆', link: '/leaderboard', color: '#ef4444', desc: 'See how you rank' },
    { label: 'Interview Experiences', icon: '🎯', link: '/interviews', color: '#8b5cf6', desc: 'Real placement stories' },
    { label: 'My Notes', icon: '📝', link: '/notes', color: '#3b82f6', desc: 'Personal revision notes' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>{greeting}, {user?.name?.split(' ')[0]}! 👋</h2>
        <p>Keep grinding — your dream job is closer than you think.</p>
      </div>

      <div className="page-body">
        {/* Streak banner */}
        {user?.streak > 0 && (
          <div className="alert alert-warning fade-in" style={{ marginBottom: 20 }}>
            🔥 You're on a <strong>{user.streak}-day streak!</strong> Keep it up to maintain your momentum.
          </div>
        )}

        {/* Quick stats */}
        <div className="stats-grid fade-in">
          {quickStats.map((stat, i) => (
            <div key={i} className="stat-card" style={{ '--stat-color': stat.color }}>
              <div className="stat-icon" style={{ background: stat.color + '20', fontSize: 22 }}>{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-change up">{stat.change}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Daily Challenge */}
          <div className="card fade-in">
            <div className="card-header">
              <span className="card-title">⚡ Daily Challenge</span>
              <span className="chip chip-medium">Today</span>
            </div>
            {dailyQ ? (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{dailyQ.title}</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <span className={`chip chip-${dailyQ.difficulty}`}>{dailyQ.difficulty}</span>
                  <span className="chip chip-info">{dailyQ.category}</span>
                </div>
                <Link to={`/coding/${dailyQ._id}`} className="btn btn-primary btn-sm">Solve Now →</Link>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading today's challenge...</div>
            )}
          </div>

          {/* Aptitude progress */}
          <div className="card fade-in">
            <div className="card-header">
              <span className="card-title">🧠 Aptitude Progress</span>
              <Link to="/aptitude" style={{ fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none' }}>View All</Link>
            </div>
            {[
              { label: 'Quantitative', pct: 72, color: 'green' },
              { label: 'Logical Reasoning', pct: 58, color: '' },
              { label: 'Verbal Ability', pct: 45, color: 'yellow' },
              { label: 'Data Interpretation', pct: 30, color: 'red' }
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.pct}%</span>
                </div>
                <div className="progress-bar"><div className={`progress-fill ${item.color}`} style={{ width: `${item.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick shortcuts */}
        <div className="card fade-in">
          <div className="card-header">
            <span className="card-title">🚀 Quick Actions</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {shortcuts.map((s, i) => (
              <Link key={i} to={s.link} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        {progress?.recentSubmissions?.length > 0 && (
          <div className="card fade-in" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title">⏱ Recent Activity</span>
              <Link to="/progress" style={{ fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none' }}>See All</Link>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Status</th>
                    <th>Difficulty</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.recentSubmissions.slice(0, 5).map(sub => (
                    <tr key={sub._id}>
                      <td style={{ color: 'var(--text-primary)' }}>{sub.question?.title || 'N/A'}</td>
                      <td>
                        <span className={`chip ${sub.status === 'accepted' ? 'chip-easy' : 'chip-hard'}`}>
                          {sub.status === 'accepted' ? '✅ Accepted' : '❌ ' + sub.status}
                        </span>
                      </td>
                      <td><span className={`chip chip-${sub.question?.difficulty}`}>{sub.question?.difficulty}</span></td>
                      <td style={{ fontSize: 12 }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
