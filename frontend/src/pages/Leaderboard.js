import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TABS = ['overall', 'coding', 'aptitude', 'streak', 'weekly', 'college'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, page]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'weekly') {
        res = await axios.get('/api/leaderboard/weekly');
        setData(res.data || []);
        setMyRank(null);
      } else if (activeTab === 'college') {
        res = await axios.get('/api/leaderboard/college');
        setData(res.data || []);
        setMyRank(null);
      } else {
        res = await axios.get('/api/leaderboard', { params: { type: activeTab, page, limit: 20 } });
        setData(res.data.leaderboard || []);
        setMyRank(res.data.myRank);
        setTotalPages(res.data.pages || 1);
      }
    } catch (e) { setData([]); }
    setLoading(false);
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return <span style={{ fontSize: 22 }}>🥇</span>;
    if (rank === 2) return <span style={{ fontSize: 22 }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: 22 }}>🥉</span>;
    return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)', fontSize: 14 }}>#{rank}</span>;
  };

  const getScore = (u) => {
    if (activeTab === 'coding') return u.codingStats?.totalSolved || 0;
    if (activeTab === 'aptitude') return u.aptitudeStats?.totalCorrect || 0;
    if (activeTab === 'streak') return u.streak || 0;
    if (activeTab === 'weekly') return u.weeklyPoints || 0;
    return u.totalPoints || 0;
  };

  const getScoreLabel = () => {
    if (activeTab === 'coding') return 'Problems Solved';
    if (activeTab === 'aptitude') return 'Correct Answers';
    if (activeTab === 'streak') return 'Day Streak';
    if (activeTab === 'weekly') return 'Weekly Points';
    return 'Total Points';
  };

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div>
      <div className="page-header">
        <h2>🏆 Leaderboard</h2>
        <p>See how you rank among your peers</p>
      </div>

      <div className="page-body">
        {/* My rank banner */}
        {myRank && (
          <div className="alert alert-info fade-in" style={{ marginBottom: 20 }}>
            🎯 Your current rank: <strong>#{myRank}</strong> — Keep practicing to climb higher!
          </div>
        )}

        {/* Tabs */}
        <div className="tabs fade-in" style={{ marginBottom: 24 }}>
          {TABS.map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setPage(1); }}>
              {tab === 'overall' ? '⭐ Overall' :
               tab === 'coding' ? '💻 Coding' :
               tab === 'aptitude' ? '🧠 Aptitude' :
               tab === 'streak' ? '🔥 Streak' :
               tab === 'weekly' ? '📅 Weekly' : '🏫 College'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : data.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">🏆</div>
            <h3>No data yet</h3>
            <p>Be the first to appear on the leaderboard!</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 32 }} className="fade-in">
                {/* 2nd place */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ background: 'var(--bg-card)', border: '2px solid #c0c0c0', borderRadius: 'var(--radius)', padding: '16px 12px', height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🥈</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{top3[1]?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{top3[1]?.college || 'N/A'}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#c0c0c0', marginTop: 4 }}>{getScore(top3[1])}</div>
                  </div>
                </div>
                {/* 1st place */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ background: 'var(--bg-card)', border: '2px solid #ffd700', borderRadius: 'var(--radius)', padding: '16px 12px', height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', boxShadow: '0 0 24px rgba(255,215,0,0.15)' }}>
                    <div style={{ fontSize: 36, marginBottom: 6 }}>🥇</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{top3[0]?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{top3[0]?.college || 'N/A'}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: '#ffd700', marginTop: 4 }}>{getScore(top3[0])}</div>
                  </div>
                </div>
                {/* 3rd place */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ background: 'var(--bg-card)', border: '2px solid #cd7f32', borderRadius: 'var(--radius)', padding: '16px 12px', height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🥉</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{top3[2]?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{top3[2]?.college || 'N/A'}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#cd7f32', marginTop: 4 }}>{getScore(top3[2])}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Full table */}
            <div className="card fade-in">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student</th>
                      <th>College</th>
                      <th>Dept / Year</th>
                      <th>{getScoreLabel()}</th>
                      <th>Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((u) => {
                      const isMe = u._id === user?._id;
                      return (
                        <tr key={u._id} style={isMe ? { background: 'rgba(99,102,241,0.08)' } : {}}>
                          <td style={{ width: 60 }}>{getRankDisplay(u.rank)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                                {u.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: isMe ? 'var(--accent-primary)' : 'var(--text-primary)', fontSize: 14 }}>
                                  {u.name} {isMe && <span className="chip chip-purple" style={{ fontSize: 10 }}>You</span>}
                                </div>
                                {u.streak > 0 && <div style={{ fontSize: 11, color: 'var(--accent-yellow)' }}>🔥 {u.streak} day streak</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.college || '—'}</td>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.department ? `${u.department} • Y${u.year}` : '—'}</td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                              {getScore(u)}
                            </span>
                          </td>
                          <td>
                            {u.badges?.slice(0, 3).map((b, i) => (
                              <span key={i} title={b.name} style={{ fontSize: 18, marginRight: 2 }}>{b.icon || '🏅'}</span>
                            ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && !['weekly', 'college'].includes(activeTab) && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 16, marginTop: 8, borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                  <span style={{ padding: '6px 14px', fontSize: 14, color: 'var(--text-secondary)' }}>{page} / {totalPages}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
