import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const categories = ['mixed', 'quantitative', 'logical', 'verbal', 'data-interpretation', 'general-knowledge', 'technical'];
const difficulties = ['mixed', 'easy', 'medium', 'hard'];
const counts = [10, 20, 30, 50];

const companyTests = [
  { company: 'TCS', logo: '🔵', rounds: 'TCS NQT Pattern', questions: 30, time: '90 min', color: '#3b82f6' },
  { company: 'Infosys', logo: '🟢', rounds: 'Infosys Online Test', questions: 25, time: '75 min', color: '#10b981' },
  { company: 'Wipro', logo: '🟡', rounds: 'NLTH Pattern', questions: 40, time: '70 min', color: '#f59e0b' },
  { company: 'Cognizant', logo: '🔴', rounds: 'GenC Elevate', questions: 55, time: '75 min', color: '#ef4444' },
  { company: 'Accenture', logo: '🟣', rounds: 'Accenture Test', questions: 90, time: '180 min', color: '#8b5cf6' },
  { company: 'HCL', logo: '⚫', rounds: 'HCL NEXT', questions: 30, time: '60 min', color: '#6366f1' },
];

export default function AptitudeList() {
  const [config, setConfig] = useState({ category: 'mixed', difficulty: 'mixed', count: 20 });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startTest = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/aptitude/start-test', config);
      navigate('/aptitude/test', { state: { testId: data.testId, questions: data.questions, config } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start test. Add questions first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>🧠 Aptitude Tests</h2>
        <p>Practice quantitative, logical, and verbal reasoning for placement exams</p>
      </div>

      <div className="page-body">
        {/* Configure Test */}
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title">⚙️ Configure Your Test</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Category</label>
              <select className="input" value={config.category} onChange={e => setConfig({ ...config, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Difficulty</label>
              <select className="input" value={config.difficulty} onChange={e => setConfig({ ...config, difficulty: e.target.value })}>
                {difficulties.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Number of Questions</label>
              <select className="input" value={config.count} onChange={e => setConfig({ ...config, count: parseInt(e.target.value) })}>
                {counts.map(c => <option key={c} value={c}>{c} Questions</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={startTest} disabled={loading}>
              {loading ? '⏳ Starting...' : '▶️ Start Test Now'}
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              ⏱ ~{Math.ceil(config.count * 1)} min • {config.count} questions • {config.count * 10} pts max
            </span>
          </div>
        </div>

        {/* Category Cards */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Practice by Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { name: 'Quantitative Aptitude', icon: '➗', count: '150+', color: '#6366f1', cat: 'quantitative' },
              { name: 'Logical Reasoning', icon: '🔗', count: '120+', color: '#10b981', cat: 'logical' },
              { name: 'Verbal Ability', icon: '📖', count: '100+', color: '#f59e0b', cat: 'verbal' },
              { name: 'Data Interpretation', icon: '📊', count: '80+', color: '#ef4444', cat: 'data-interpretation' },
              { name: 'Technical Aptitude', icon: '⚙️', count: '90+', color: '#8b5cf6', cat: 'technical' },
              { name: 'General Knowledge', icon: '🌍', count: '70+', color: '#3b82f6', cat: 'general-knowledge' },
            ].map(cat => (
              <div key={cat.cat}
                className="card"
                style={{ cursor: 'pointer', transition: 'all 0.2s', borderColor: 'var(--border)' }}
                onClick={() => { setConfig({ ...config, category: cat.cat }); }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{cat.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--text-primary)' }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.count} questions</div>
                {config.category === cat.cat && <div style={{ marginTop: 8 }}><span className="chip chip-purple">✓ Selected</span></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Company-specific tests */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Company-Specific Tests</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {companyTests.map(test => (
              <div key={test.company} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: test.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {test.logo}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{test.company}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{test.rounds}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="chip chip-info">{test.questions} Qs</span>
                    <span className="chip chip-purple">{test.time}</span>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setConfig({ ...config, category: 'mixed', count: test.questions }); startTest(); }}
                >
                  Start →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
