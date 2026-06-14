import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CATEGORIES_APT = ['quantitative', 'logical', 'verbal', 'data-interpretation', 'general-knowledge', 'technical'];
const CATEGORIES_CODE = ['arrays', 'strings', 'linked-list', 'trees', 'graphs', 'dp', 'sorting', 'searching', 'recursion', 'stack-queue', 'hashing', 'math', 'greedy', 'backtracking'];
const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'HCL', 'Google', 'Amazon', 'Microsoft', 'Zoho', 'Freshworks', 'General'];

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ users: 0, aptitude: 0, coding: 0 });
  const [loading, setLoading] = useState(false);

  // Aptitude form
  const [aptForm, setAptForm] = useState({
    question: '', options: ['', '', '', ''], correctAnswer: 0,
    explanation: '', category: 'quantitative', difficulty: 'medium',
    company: 'General', points: 10
  });

  // Coding form
  const [codeForm, setCodeForm] = useState({
    title: '', description: '', difficulty: 'easy', category: 'arrays',
    company: [], points: 20, constraints: '',
    examples: [{ input: '', output: '', explanation: '' }],
    hints: [''],
    starterCode: {
      javascript: '/**\n * @param {}\n * @return {}\n */\nfunction solution() {\n    // Your code here\n}',
      python: 'def solution():\n    # Your code here\n    pass',
      java: 'class Solution {\n    public void solution() {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    void solution() {\n        // Your code here\n    }\n};'
    }
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchStats();
    fetchStudents();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [aptRes, codeRes, userRes] = await Promise.allSettled([
        axios.get('/api/aptitude/questions', { params: { limit: 1 } }),
        axios.get('/api/coding/questions', { params: { limit: 1 } }),
        axios.get('/api/users')
      ]);
      setStats({
        aptitude: aptRes.status === 'fulfilled' ? aptRes.value.data.total || 0 : 0,
        coding: codeRes.status === 'fulfilled' ? codeRes.value.data.total || 0 : 0,
        users: userRes.status === 'fulfilled' ? userRes.value.data.total || 0 : 0,
      });
    } catch (e) {}
  };

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/api/users', { params: { limit: 50 } });
      setStudents(data.users || []);
    } catch (e) {}
  };

  const deleteStudent = async (id, name) => {
  if (!window.confirm(`Delete "${name}"?`)) return;
  try {
    await axios.delete(`/api/users/${id}`);
    toast.success('🗑️ Student deleted!');
    fetchStudents();
  } catch (e) {
    toast.error('Failed to delete');
  }
};

  const deleteStudent = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('🗑️ Student deleted!');
      fetchStudents();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const submitAptitude = async (e) => {
    e.preventDefault();
    if (aptForm.options.some(o => !o.trim())) return toast.error('All 4 options required!');
    if (!aptForm.question.trim()) return toast.error('Question required!');
    setLoading(true);
    try {
      await axios.post('/api/aptitude/questions', aptForm);
      toast.success('✅ Aptitude question added!');
      setAptForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', category: 'quantitative', difficulty: 'medium', company: 'General', points: 10 });
      fetchStats();
    } catch (e) { toast.error('Failed to add question'); }
    setLoading(false);
  };

  const submitCoding = async (e) => {
    e.preventDefault();
    if (!codeForm.title.trim() || !codeForm.description.trim()) return toast.error('Title and description required!');
    setLoading(true);
    try {
      await axios.post('/api/coding/questions', codeForm);
      toast.success('✅ Coding question added!');
      setCodeForm({ title: '', description: '', difficulty: 'easy', category: 'arrays', company: [], points: 20, constraints: '', examples: [{ input: '', output: '', explanation: '' }], hints: [''], starterCode: { javascript: '', python: '', java: '', cpp: '' } });
      fetchStats();
    } catch (e) { toast.error('Failed to add question'); }
    setLoading(false);
  };

  const updateOption = (i, val) => {
    const opts = [...aptForm.options];
    opts[i] = val;
    setAptForm({ ...aptForm, options: opts });
  };

  const addExample = () => setCodeForm({ ...codeForm, examples: [...codeForm.examples, { input: '', output: '', explanation: '' }] });
  const updateExample = (i, field, val) => {
    const ex = [...codeForm.examples];
    ex[i][field] = val;
    setCodeForm({ ...codeForm, examples: ex });
  };
  const addHint = () => setCodeForm({ ...codeForm, hints: [...codeForm.hints, ''] });
  const updateHint = (i, val) => {
    const h = [...codeForm.hints];
    h[i] = val;
    setCodeForm({ ...codeForm, hints: h });
  };
  const toggleCompany = (c) => {
    const arr = codeForm.company.includes(c) ? codeForm.company.filter(x => x !== c) : [...codeForm.company, c];
    setCodeForm({ ...codeForm, company: arr });
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'add-aptitude', label: '🧠 Add Aptitude Q' },
    { id: 'add-coding', label: '💻 Add Coding Q' },
    { id: 'students', label: '👥 Students' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>👑 Admin Panel</h2>
        <p>Manage questions, students, and content</p>
      </div>

      <div className="page-body">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== DASHBOARD ===== */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              {[
                { label: 'Total Students', value: stats.users, icon: '👥', color: '#6366f1' },
                { label: 'Aptitude Questions', value: stats.aptitude, icon: '🧠', color: '#10b981' },
                { label: 'Coding Problems', value: stats.coding, icon: '💻', color: '#f59e0b' },
                { label: 'You are Admin', value: '👑', icon: '🔐', color: '#ef4444' },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ '--stat-color': s.color }}>
                  <div className="stat-icon" style={{ background: s.color + '20', fontSize: 22 }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">🚀 Quick Actions</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Add Aptitude Question', icon: '🧠', tab: 'add-aptitude', color: '#6366f1' },
                  { label: 'Add Coding Problem', icon: '💻', tab: 'add-coding', color: '#10b981' },
                  { label: 'View All Students', icon: '👥', tab: 'students', color: '#f59e0b' },
                ].map(a => (
                  <div key={a.tab} onClick={() => setActiveTab(a.tab)}
                    style={{ padding: 16, background: 'var(--bg-secondary)', border: `1px solid ${a.color}40`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = a.color + '40'}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== ADD APTITUDE ===== */}
        {activeTab === 'add-aptitude' && (
          <div className="card fade-in">
            <div className="card-header"><span className="card-title">🧠 Add Aptitude Question</span></div>
            <form onSubmit={submitAptitude}>

              <div className="input-group">
                <label className="input-label">Question *</label>
                <textarea className="input" rows={3} placeholder="Type the question here..." value={aptForm.question}
                  onChange={e => setAptForm({ ...aptForm, question: e.target.value })} required style={{ resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Answer Options * (Select correct answer)</label>
                {aptForm.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <input type="radio" name="correct" checked={aptForm.correctAnswer === i}
                      onChange={() => setAptForm({ ...aptForm, correctAnswer: i })}
                      style={{ width: 18, height: 18, accentColor: 'var(--accent-green)' }} />
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: aptForm.correctAnswer === i ? 'var(--accent-green)' : 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, color: aptForm.correctAnswer === i ? 'white' : 'var(--text-muted)' }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <input className="input" style={{ flex: 1, marginBottom: 0 }} placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt} onChange={e => updateOption(i, e.target.value)} required />
                    {aptForm.correctAnswer === i && <span style={{ color: 'var(--accent-green)', fontSize: 18 }}>✅</span>}
                  </div>
                ))}
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>🔘 Radio button select pannunga = correct answer</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Category *</label>
                  <select className="input" value={aptForm.category} onChange={e => setAptForm({ ...aptForm, category: e.target.value })}>
                    {CATEGORIES_APT.map(c => <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Difficulty *</label>
                  <select className="input" value={aptForm.difficulty} onChange={e => setAptForm({ ...aptForm, difficulty: e.target.value })}>
                    {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Company</label>
                  <select className="input" value={aptForm.company} onChange={e => setAptForm({ ...aptForm, company: e.target.value })}>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Points</label>
                  <input type="number" className="input" value={aptForm.points} onChange={e => setAptForm({ ...aptForm, points: parseInt(e.target.value) })} min={5} max={50} />
                </div>
              </div>

              <div style={{ height: 12 }} />
              <div className="input-group">
                <label className="input-label">Explanation (Optional)</label>
                <textarea className="input" rows={2} placeholder="Explain why the correct answer is right..."
                  value={aptForm.explanation} onChange={e => setAptForm({ ...aptForm, explanation: e.target.value })} style={{ resize: 'vertical' }} />
              </div>

              {/* Preview */}
              {aptForm.question && (
                <div style={{ marginBottom: 16, padding: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>📋 Preview</div>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>{aptForm.question}</p>
                  {aptForm.options.map((opt, i) => opt && (
                    <div key={i} style={{ padding: '6px 12px', margin: '4px 0', borderRadius: 6, background: aptForm.correctAnswer === i ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)', border: `1px solid ${aptForm.correctAnswer === i ? 'var(--accent-green)' : 'var(--border)'}`, fontSize: 14 }}>
                      {String.fromCharCode(65 + i)}. {opt} {aptForm.correctAnswer === i && '✅'}
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? '⏳ Adding...' : '➕ Add Question'}
              </button>
            </form>
          </div>
        )}

        {/* ===== ADD CODING ===== */}
        {activeTab === 'add-coding' && (
          <div className="card fade-in">
            <div className="card-header"><span className="card-title">💻 Add Coding Problem</span></div>
            <form onSubmit={submitCoding}>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Problem Title *</label>
                  <input className="input" placeholder="e.g. Two Sum, Fibonacci Series..." value={codeForm.title}
                    onChange={e => setCodeForm({ ...codeForm, title: e.target.value })} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Points</label>
                  <input type="number" className="input" value={codeForm.points} onChange={e => setCodeForm({ ...codeForm, points: parseInt(e.target.value) })} />
                </div>
              </div>
              <div style={{ height: 12 }} />

              <div className="input-group">
                <label className="input-label">Problem Description *</label>
                <textarea className="input" rows={5} placeholder="Describe the problem in detail..."
                  value={codeForm.description} onChange={e => setCodeForm({ ...codeForm, description: e.target.value })} required style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Difficulty *</label>
                  <select className="input" value={codeForm.difficulty} onChange={e => setCodeForm({ ...codeForm, difficulty: e.target.value })}>
                    {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Category *</label>
                  <select className="input" value={codeForm.category} onChange={e => setCodeForm({ ...codeForm, category: e.target.value })}>
                    {CATEGORIES_CODE.map(c => <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ height: 12 }} />

              <div className="input-group">
                <label className="input-label">Constraints</label>
                <textarea className="input" rows={2} placeholder="1 <= n <= 10^5..." value={codeForm.constraints}
                  onChange={e => setCodeForm({ ...codeForm, constraints: e.target.value })} style={{ resize: 'vertical' }} />
              </div>

              {/* Companies */}
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Companies (Select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {COMPANIES.filter(c => c !== 'General').map(c => (
                    <button key={c} type="button" onClick={() => toggleCompany(c)}
                      className={`chip ${codeForm.company.includes(c) ? 'chip-purple' : ''}`}
                      style={{ cursor: 'pointer', background: codeForm.company.includes(c) ? undefined : 'var(--bg-secondary)', color: codeForm.company.includes(c) ? undefined : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {codeForm.company.includes(c) ? '✓ ' : ''}{c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Examples</label>
                {codeForm.examples.map((ex, i) => (
                  <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Example {i + 1}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div><label className="input-label" style={{ fontSize: 11 }}>Input</label>
                        <input className="input" style={{ marginBottom: 0, fontFamily: 'var(--font-mono)' }} placeholder="nums = [1,2,3]" value={ex.input} onChange={e => updateExample(i, 'input', e.target.value)} /></div>
                      <div><label className="input-label" style={{ fontSize: 11 }}>Output</label>
                        <input className="input" style={{ marginBottom: 0, fontFamily: 'var(--font-mono)' }} placeholder="6" value={ex.output} onChange={e => updateExample(i, 'output', e.target.value)} /></div>
                    </div>
                    <div style={{ marginTop: 8 }}><label className="input-label" style={{ fontSize: 11 }}>Explanation (Optional)</label>
                      <input className="input" style={{ marginBottom: 0 }} placeholder="Because 1+2+3=6" value={ex.explanation} onChange={e => updateExample(i, 'explanation', e.target.value)} /></div>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={addExample}>+ Add Example</button>
              </div>

              {/* Hints */}
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Hints (Optional)</label>
                {codeForm.hints.map((h, i) => (
                  <input key={i} className="input" style={{ marginBottom: 8 }} placeholder={`Hint ${i + 1}`} value={h} onChange={e => updateHint(i, e.target.value)} />
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={addHint}>+ Add Hint</button>
              </div>

              {/* Starter Code */}
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Starter Code (Optional)</label>
                <div className="tabs" style={{ marginBottom: 12 }}>
                  {['javascript', 'python', 'java', 'cpp'].map(lang => (
                    <button key={lang} type="button" className="tab active" style={{ fontSize: 12 }}>{lang}</button>
                  ))}
                </div>
                <textarea className="input" rows={5}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 13, resize: 'vertical' }}
                  placeholder="JavaScript starter code..."
                  value={codeForm.starterCode.javascript}
                  onChange={e => setCodeForm({ ...codeForm, starterCode: { ...codeForm.starterCode, javascript: e.target.value } })} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? '⏳ Adding...' : '➕ Add Problem'}
              </button>
            </form>
          </div>
        )}

        {/* ===== STUDENTS ===== */}
        {activeTab === 'students' && (
          <div className="fade-in">
            <div className="card">
              <div className="card-header">
                <span className="card-title">👥 All Students ({students.length})</span>
                <button className="btn btn-secondary btn-sm" onClick={fetchStudents}>🔄 Refresh</button>
              </div>
              {students.length === 0 ? (
                <div className="empty-state"><div className="icon">👥</div><h3>No students yet</h3></div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Dept/Year</th>
                        <th>Points</th>
                        <th>Solved</th>
                        <th>Streak</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s._id}>
                          <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{s.name?.charAt(0)?.toUpperCase()}</div>
                              <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.email}</td>
                          <td style={{ fontSize: 13 }}>{s.college || '—'}</td>
                          <td style={{ fontSize: 13 }}>{s.department ? `${s.department} Y${s.year}` : '—'}</td>
                          <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-yellow)' }}>{s.totalPoints || 0}</span></td>
                          <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>{s.codingStats?.totalSolved || 0}</span></td>
                          <td>{s.streak > 0 ? <span style={{ color: 'var(--accent-yellow)' }}>🔥 {s.streak}</span> : '—'}</td>
                          <td><span className={`chip ${s.role === 'admin' ? 'chip-hard' : 'chip-info'}`}>{s.role}</span></td>
                          <td>
  {s.role !== 'admin' && (
    <button className="btn btn-secondary btn-sm" onClick={() => deleteStudent(s._id, s.name)}>🗑️ Delete</button>
  )}
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
