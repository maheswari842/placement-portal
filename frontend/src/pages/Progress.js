import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Progress() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    axios.get('/api/progress')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const codingTotal = (user?.codingStats?.easySolved || 0) + (user?.codingStats?.mediumSolved || 0) + (user?.codingStats?.hardSolved || 0);

  return (
    <div>
      <div className="page-header">
        <h2>📊 My Progress</h2>
        <p>Track your growth and identify areas to improve</p>
      </div>

      <div className="page-body">
        {/* Top stats */}
        <div className="stats-grid fade-in">
          {[
            { label: 'Total Points', value: user?.totalPoints || 0, icon: '⭐', color: '#f59e0b' },
            { label: 'Problems Solved', value: codingTotal, icon: '✅', color: '#10b981' },
            { label: 'Tests Taken', value: user?.aptitudeStats?.totalAttempted ? Math.floor(user.aptitudeStats.totalAttempted / 20) : 0, icon: '📝', color: '#6366f1' },
            { label: 'Day Streak', value: user?.streak || 0, icon: '🔥', color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ '--stat-color': s.color }}>
              <div className="stat-icon" style={{ background: s.color + '20' }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="tabs fade-in">
          {['overview', 'coding', 'aptitude', 'activity'].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="fade-in">
            {/* Coding breakdown */}
            <div className="card">
              <div className="card-header"><span className="card-title">💻 Coding Breakdown</span></div>
              {[
                { label: 'Easy', value: user?.codingStats?.easySolved || 0, total: 50, color: 'green' },
                { label: 'Medium', value: user?.codingStats?.mediumSolved || 0, total: 50, color: 'yellow' },
                { label: 'Hard', value: user?.codingStats?.hardSolved || 0, total: 30, color: 'red' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}><span className={`chip chip-${item.label.toLowerCase()}`} style={{ marginRight: 6 }}>{item.label}</span></span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.value} / {item.total}</span>
                  </div>
                  <div className="progress-bar"><div className={`progress-fill ${item.color}`} style={{ width: `${Math.min(100, (item.value / item.total) * 100)}%` }} /></div>
                </div>
              ))}
            </div>

            {/* Aptitude breakdown */}
            <div className="card">
              <div className="card-header"><span className="card-title">🧠 Aptitude Accuracy</span></div>
              {[
                { label: 'Quantitative', pct: 72 },
                { label: 'Logical', pct: 65 },
                { label: 'Verbal', pct: 58 },
                { label: 'Data Interpretation', pct: 45 },
                { label: 'Technical', pct: 70 },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${item.pct >= 70 ? 'green' : item.pct >= 50 ? '' : 'yellow'}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header"><span className="card-title">🏅 Badges Earned</span></div>
              {user?.badges?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {user.badges.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 24 }}>{b.icon || '🏅'}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                  No badges yet. Keep solving to earn them! 🎯
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'coding' && (
          <div className="fade-in">
            {/* Category progress */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><span className="card-title">Category-wise Progress</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {(data?.categoryProgress || [
                  { _id: 'arrays', count: 8 }, { _id: 'strings', count: 5 }, { _id: 'dp', count: 3 },
                  { _id: 'trees', count: 4 }, { _id: 'graphs', count: 2 }, { _id: 'sorting', count: 6 }
                ]).map(cat => (
                  <div key={cat._id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: 4 }}>{cat._id?.replace('-', ' ')}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent-green)' }}>{cat.count}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>solved</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent submissions */}
            <div className="card">
              <div className="card-header"><span className="card-title">Recent Submissions</span></div>
              {data?.recentSubmissions?.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Problem</th><th>Status</th><th>Language</th><th>Runtime</th><th>Date</th></tr></thead>
                    <tbody>
                      {data.recentSubmissions.map(sub => (
                        <tr key={sub._id}>
                          <td style={{ color: 'var(--text-primary)' }}>{sub.question?.title || 'N/A'}</td>
                          <td><span className={`chip ${sub.status === 'accepted' ? 'chip-easy' : 'chip-hard'}`}>{sub.status === 'accepted' ? '✅ AC' : '❌ WA'}</span></td>
                          <td><span className="tag">{sub.language}</span></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{sub.runtime}ms</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 40 }}><div className="icon">💻</div><h3>No submissions yet</h3><p>Start solving problems!</p></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'aptitude' && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><span className="card-title">Accuracy Overview</span></div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                    {user?.aptitudeStats?.totalAttempted > 0
                      ? Math.round((user.aptitudeStats.totalCorrect / user.aptitudeStats.totalAttempted) * 100)
                      : 0}%
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Overall Accuracy</div>
                </div>
                <div>
                  {[
                    { label: 'Total Questions Attempted', value: user?.aptitudeStats?.totalAttempted || 0 },
                    { label: 'Correct Answers', value: user?.aptitudeStats?.totalCorrect || 0 },
                    { label: 'Wrong Answers', value: (user?.aptitudeStats?.totalAttempted || 0) - (user?.aptitudeStats?.totalCorrect || 0) },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, minWidth: 60 }}>{s.value}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Test history */}
            <div className="card">
              <div className="card-header"><span className="card-title">Test History</span></div>
              {data?.recentTests?.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Category</th><th>Score</th><th>Accuracy</th><th>Time</th><th>Date</th></tr></thead>
                    <tbody>
                      {data.recentTests.map(test => (
                        <tr key={test._id}>
                          <td><span className="chip chip-info">{test.category}</span></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{test.score}</td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', color: test.percentage >= 60 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                              {test.percentage}%
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.floor((test.timeTaken || 0) / 60)}m</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(test.completedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 40 }}><div className="icon">🧠</div><h3>No tests taken yet</h3></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="fade-in">
            <div className="card">
              <div className="card-header"><span className="card-title">📅 Activity Heatmap (Last 30 Days)</span></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {Array.from({ length: 30 }, (_, i) => {
                  const d = new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0];
                  const act = data?.codingActivity?.find(a => a._id === d);
                  const count = act?.count || 0;
                  const opacity = count === 0 ? 0.1 : count === 1 ? 0.3 : count <= 3 ? 0.6 : 1;
                  return (
                    <div key={i} title={`${d}: ${count} submissions`}
                      style={{ width: 28, height: 28, borderRadius: 4, background: `rgba(16,185,129,${opacity})`, border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer' }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Less</span>
                {[0.1, 0.3, 0.6, 1].map((o, i) => (
                  <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: `rgba(16,185,129,${o})` }} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
