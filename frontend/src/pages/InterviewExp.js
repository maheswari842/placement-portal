import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'HCL', 'Capgemini', 'IBM', 'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Zoho', 'Freshworks', 'Other'];

export default function InterviewExp() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ company: '', result: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({
    company: '', role: '', package: '', difficulty: 'medium', result: 'pending',
    experience: '', tips: '', isAnonymous: false,
    rounds: [{ roundName: 'Round 1', description: '', questions: [''], tips: '' }]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchExperiences(); }, [filters, page]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filters.company) params.company = filters.company;
      if (filters.result) params.result = filters.result;
      const { data } = await axios.get('/api/interviews', { params });
      setExperiences(data.experiences || []);
      setTotalPages(data.pages || 1);
    } catch (e) { setExperiences([]); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/interviews', form);
      toast.success('Experience shared! Thank you 🙏');
      setShowModal(false);
      setForm({ company: '', role: '', package: '', difficulty: 'medium', result: 'pending', experience: '', tips: '', isAnonymous: false, rounds: [{ roundName: 'Round 1', description: '', questions: [''], tips: '' }] });
      fetchExperiences();
    } catch (e) { toast.error('Failed to submit'); }
    setSubmitting(false);
  };

  const handleLike = async (id) => {
    try {
      await axios.post(`/api/interviews/${id}/like`);
      fetchExperiences();
    } catch (e) {}
  };

  const resultColors = { selected: 'chip-easy', rejected: 'chip-hard', pending: 'chip-medium', withdrew: 'chip-info' };
  const resultIcons = { selected: '✅', rejected: '❌', pending: '⏳', withdrew: '🚪' };

  return (
    <div>
      <div className="page-header">
        <h2>🎯 Interview Experiences</h2>
        <p>Real placement stories from students like you</p>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select className="input" style={{ width: 180, marginBottom: 0 }} value={filters.company} onChange={e => { setFilters({ ...filters, company: e.target.value }); setPage(1); }}>
              <option value="">All Companies</option>
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input" style={{ width: 160, marginBottom: 0 }} value={filters.result} onChange={e => { setFilters({ ...filters, result: e.target.value }); setPage(1); }}>
              <option value="">All Results</option>
              {['selected', 'rejected', 'pending', 'withdrew'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>✏️ Share Your Experience</button>
        </div>

        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <>
            {experiences.length === 0 ? (
              <div className="empty-state card"><div className="icon">🎯</div><h3>No experiences yet</h3><p>Be the first to share your placement story!</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {experiences.map(exp => (
                  <div key={exp._id} className="card fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid var(--border)' }}>
                            🏢
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{exp.company}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{exp.role}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className={`chip ${resultColors[exp.result]}`}>{resultIcons[exp.result]} {exp.result}</span>
                          <span className={`chip chip-${exp.difficulty}`}>{exp.difficulty}</span>
                          {exp.package && <span className="chip chip-purple">💰 {exp.package}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{exp.isAnonymous ? 'Anonymous' : exp.user?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exp.user?.college || ''}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(exp.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                      {expanded === exp._id ? exp.experience : exp.experience?.substring(0, 200) + (exp.experience?.length > 200 ? '...' : '')}
                    </p>

                    {exp.experience?.length > 200 && (
                      <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: 13, marginBottom: 12 }}
                        onClick={() => setExpanded(expanded === exp._id ? null : exp._id)}>
                        {expanded === exp._id ? 'Show less ↑' : 'Read more ↓'}
                      </button>
                    )}

                    {exp.rounds?.length > 0 && expanded === exp._id && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Interview Rounds:</div>
                        {exp.rounds.map((r, i) => (
                          <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{r.roundName}</div>
                            {r.description && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.description}</div>}
                          </div>
                        ))}
                      </div>
                    )}

                    {exp.tips && expanded === exp._id && (
                      <div style={{ padding: 12, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--accent-green)', marginBottom: 12 }}>
                        💡 Tip: {exp.tips}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      <button onClick={() => handleLike(exp._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: exp.likes?.includes(user?._id) ? 'var(--accent-red)' : 'var(--text-muted)', fontSize: 14 }}>
                        {exp.likes?.includes(user?._id) ? '❤️' : '🤍'} {exp.likes?.length || 0} helpful
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                <span style={{ padding: '6px 14px', fontSize: 14, color: 'var(--text-secondary)' }}>{page} / {totalPages}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Experience Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Share Your Experience</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Company *</label>
                  <select className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required>
                    <option value="">Select Company</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Role *</label>
                  <input className="input" placeholder="Software Engineer" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Package</label>
                  <input className="input" placeholder="6.5 LPA" value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Result</label>
                  <select className="input" value={form.result} onChange={e => setForm({ ...form, result: e.target.value })}>
                    {['selected', 'rejected', 'pending', 'withdrew'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className="input-group">
                <label className="input-label">Your Experience *</label>
                <textarea className="input" rows={5} placeholder="Describe the interview process, questions asked, your preparation strategy..." value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} required style={{ resize: 'vertical' }} />
              </div>
              <div className="input-group">
                <label className="input-label">Tips for Others</label>
                <textarea className="input" rows={3} placeholder="What would you suggest to others?" value={form.tips} onChange={e => setForm({ ...form, tips: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <input type="checkbox" id="anon" checked={form.isAnonymous} onChange={e => setForm({ ...form, isAnonymous: e.target.checked })} />
                <label htmlFor="anon" style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>Post anonymously</label>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '⏳ Posting...' : '📤 Share Experience'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
