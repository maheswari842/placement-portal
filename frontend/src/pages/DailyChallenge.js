import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/coding/daily-challenge')
      .then(r => setChallenge(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  return (
    <div>
      <div className="page-header">
        <h2>⚡ Daily Challenge</h2>
        <p>A fresh problem every day to keep your skills sharp</p>
      </div>

      <div className="page-body">
        <div className="alert alert-warning fade-in" style={{ marginBottom: 20 }}>
          ⏰ Resets in <strong>{hrs}h {mins}m</strong> — solve it before it's gone!
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : challenge ? (
          <div className="card fade-in" style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--accent-yellow)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>⚡ Today's Challenge</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{challenge.title}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`chip chip-${challenge.difficulty}`}>{challenge.difficulty}</span>
                  <span className="chip chip-info">{challenge.category}</span>
                  {challenge.company?.map(c => <span key={c} className="tag">{c}</span>)}
                </div>
              </div>
              <div style={{ fontSize: 64 }}>⚡</div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15, marginBottom: 20 }}>
              {challenge.description?.substring(0, 300)}...
            </p>

            {challenge.examples?.[0] && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, marginBottom: 20, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Example</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Input: </span><span style={{ color: 'var(--accent-green)' }}>{challenge.examples[0].input}</span><br />
                  <span style={{ color: 'var(--text-muted)' }}>Output: </span><span style={{ color: 'var(--accent-primary)' }}>{challenge.examples[0].output}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <Link to={`/coding/${challenge._id}`} className="btn btn-primary btn-lg">
                🚀 Solve Challenge
              </Link>
              <Link to="/coding" className="btn btn-secondary btn-lg">Browse All Problems</Link>
            </div>
          </div>
        ) : (
          <div className="empty-state card">
            <div className="icon">⚡</div>
            <h3>No challenge today</h3>
            <p>Add coding questions to enable daily challenges.</p>
            <Link to="/coding" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Problems →</Link>
          </div>
        )}

        {/* Streak motivation */}
        <div className="card fade-in" style={{ marginTop: 24, maxWidth: 700 }}>
          <div className="card-header"><span className="card-title">🔥 Why Daily Practice?</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { icon: '🧠', title: 'Builds Habit', desc: 'Daily solving trains your brain to think algorithmically' },
              { icon: '📈', title: 'Track Growth', desc: 'See your improvement over weeks and months' },
              { icon: '🏆', title: 'Earn Badges', desc: 'Complete streaks to unlock exclusive badges' },
              { icon: '🎯', title: 'Interview Ready', desc: 'Companies love candidates with consistent practice' },
            ].map(item => (
              <div key={item.title} style={{ padding: 14, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
