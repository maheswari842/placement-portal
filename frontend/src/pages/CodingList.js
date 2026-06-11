import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const categories = ['all', 'arrays', 'strings', 'linked-list', 'trees', 'graphs', 'dp', 'sorting', 'searching', 'recursion', 'stack-queue', 'hashing', 'math', 'greedy', 'backtracking'];
const difficulties = ['all', 'easy', 'medium', 'hard'];

export default function CodingList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', difficulty: 'all', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQuestions();
  }, [filters, page]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.difficulty !== 'all') params.difficulty = filters.difficulty;
      if (filters.search) params.search = filters.search;

      const { data } = await axios.get('/api/coding/questions', { params });
      setQuestions(data.questions || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      setQuestions([]);
    }
    setLoading(false);
  };

  const stats = {
    total: questions.length,
    solved: questions.filter(q => q.isSolved).length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  };

  return (
    <div>
      <div className="page-header">
        <h2>💻 Coding Questions</h2>
        <p>Practice data structures, algorithms, and problem-solving</p>
      </div>

      <div className="page-body">
        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
            { label: 'Solved', value: stats.solved, color: 'var(--accent-green)' },
            { label: 'Easy', value: stats.easy, color: 'var(--accent-green)' },
            { label: 'Medium', value: stats.medium, color: 'var(--accent-yellow)' },
            { label: 'Hard', value: stats.hard, color: 'var(--accent-red)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="input"
              placeholder="🔍 Search problems..."
              style={{ maxWidth: 260, marginBottom: 0 }}
              value={filters.search}
              onChange={e => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
            />
            <select className="input" style={{ maxWidth: 160, marginBottom: 0 }} value={filters.difficulty}
              onChange={e => { setFilters({ ...filters, difficulty: e.target.value }); setPage(1); }}>
              {difficulties.map(d => <option key={d} value={d}>{d === 'all' ? 'All Difficulties' : d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
            <select className="input" style={{ maxWidth: 200, marginBottom: 0 }} value={filters.category}
              onChange={e => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}>
              {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {categories.slice(1).map(c => (
              <button key={c} className={`chip ${filters.category === c ? 'chip-purple' : ''}`}
                style={{ cursor: 'pointer', background: filters.category === c ? undefined : 'var(--bg-secondary)', color: filters.category === c ? undefined : 'var(--text-muted)', border: '1px solid var(--border)' }}
                onClick={() => { setFilters({ ...filters, category: filters.category === c ? 'all' : c }); setPage(1); }}>
                {c.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Questions table */}
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💻</div>
              <h3>No questions found</h3>
              <p>Try adjusting your filters or add questions via the admin panel.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Problem</th>
                    <th>Difficulty</th>
                    <th>Category</th>
                    <th>Acceptance</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr key={q._id}>
                      <td style={{ color: 'var(--text-muted)', width: 40 }}>{(page - 1) * 20 + i + 1}</td>
                      <td>
                        <div>
                          <Link to={`/coding/${q._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
                            {q.title}
                          </Link>
                          {q.company?.length > 0 && (
                            <div style={{ marginTop: 3 }}>
                              {q.company.slice(0, 2).map(c => <span key={c} className="tag">{c}</span>)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td><span className={`chip chip-${q.difficulty}`}>{q.difficulty}</span></td>
                      <td><span className="chip chip-info">{q.category}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{q.acceptanceRate || Math.floor(Math.random() * 40 + 40)}%</td>
                      <td>
                        {q.isSolved ? <span className="chip chip-easy">✅ Solved</span>
                          : q.isBookmarked ? <span className="chip chip-purple">🔖 Saved</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                      </td>
                      <td>
                        <Link to={`/coding/${q._id}`} className="btn btn-secondary btn-sm">Solve →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 16, marginTop: 12, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <span style={{ padding: '6px 14px', fontSize: 14, color: 'var(--text-secondary)' }}>{page} / {totalPages}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
