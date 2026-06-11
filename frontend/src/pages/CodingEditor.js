import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp'];

export default function CodingEditor() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('problem');
  const [showHint, setShowHint] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  useEffect(() => {
    if (question?.starterCode?.[language]) setCode(question.starterCode[language]);
  }, [language, question]);

  const fetchQuestion = async () => {
    try {
      const { data } = await axios.get(`/api/coding/questions/${id}`);
      setQuestion(data);
      setIsBookmarked(data.isBookmarked || false);
      const lang = 'javascript';
      setCode(data.starterCode?.[lang] || '// Write your solution here\n');
    } catch (e) { toast.error('Question not found'); }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return toast.error('Please write some code first');
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await axios.post(`/api/coding/submit/${id}`, { code, language });
      setResult(data);
      if (data.status === 'accepted') toast.success('🎉 Accepted! Great solution!');
      else toast.error(`❌ ${data.status.replace('-', ' ')}`);
      setActiveTab('result');
    } catch (e) { toast.error('Submission failed'); }
    setSubmitting(false);
  };

  const toggleBookmark = async () => {
    try {
      const { data } = await axios.post(`/api/coding/bookmark/${id}`);
      setIsBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? '🔖 Bookmarked!' : 'Removed from bookmarks');
    } catch (e) {}
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!question) return <div className="page-body"><div className="empty-state"><h3>Question not found</h3><Link to="/coding" className="btn btn-primary">← Back</Link></div></div>;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left panel - Problem */}
      <div style={{ width: '42%', minWidth: 360, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Problem header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Link to="/coding" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>← Problems</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{question.title}</h2>
            <button onClick={toggleBookmark} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>
              {isBookmarked ? '🔖' : '📌'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span className={`chip chip-${question.difficulty}`}>{question.difficulty}</span>
            <span className="chip chip-info">{question.category}</span>
            {question.company?.map(c => <span key={c} className="tag">{c}</span>)}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {['problem', 'submissions', 'result'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: activeTab === tab ? 600 : 400, borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {activeTab === 'problem' && (
            <div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 20, whiteSpace: 'pre-wrap' }}>{question.description}</div>

              {question.examples?.map((ex, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Example {i + 1}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Input: </span><span style={{ color: 'var(--accent-green)' }}>{ex.input}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Output: </span><span style={{ color: 'var(--accent-primary)' }}>{ex.output}</span></div>
                    {ex.explanation && <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: 12 }}>Explanation: {ex.explanation}</div>}
                  </div>
                </div>
              ))}

              {question.constraints && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Constraints:</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: 12, borderRadius: 6, border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{question.constraints}</div>
                </div>
              )}

              {question.hints?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setShowHint(true); setHintIdx(0); }}>💡 Get Hint</button>
                  {showHint && (
                    <div style={{ marginTop: 10, padding: 12, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--accent-yellow)' }}>
                      💡 {question.hints[hintIdx]}
                      {hintIdx < question.hints.length - 1 && (
                        <button style={{ marginLeft: 12, background: 'none', border: 'none', color: 'var(--accent-yellow)', cursor: 'pointer', fontSize: 12 }} onClick={() => setHintIdx(i => i + 1)}>Next hint →</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && <SubmissionsList questionId={id} />}

          {activeTab === 'result' && result && (
            <div>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{result.status === 'accepted' ? '🎉' : '❌'}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: result.status === 'accepted' ? 'var(--accent-green)' : 'var(--accent-red)', marginBottom: 8 }}>
                  {result.status === 'accepted' ? 'Accepted!' : result.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  {result.testCasesPassed}/{result.totalTestCases} test cases passed
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>{result.runtime}ms</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Runtime</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>{(result.memory / 1000).toFixed(1)} MB</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Memory</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Editor toolbar */}
        <div style={{ padding: '10px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <select className="input" style={{ width: 160, marginBottom: 0, fontSize: 13 }} value={language} onChange={e => setLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setCode(question.starterCode?.[language] || '')}>Reset</button>
            <button className="btn btn-success" onClick={handleSubmit} disabled={submitting} style={{ minWidth: 120 }}>
              {submitting ? '⏳ Running...' : '▶ Submit'}
            </button>
          </div>
        </div>

        {/* Code textarea */}
        <div className="code-editor" style={{ flex: 1, borderRadius: 0, border: 'none', display: 'flex', flexDirection: 'column' }}>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ flex: 1, width: '100%', background: '#0d1117', border: 'none', outline: 'none', color: '#e6edf3', fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 1.7, padding: 16, resize: 'none', tabSize: 2 }}
            placeholder="Write your solution here..."
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                const newVal = code.substring(0, start) + '  ' + code.substring(end);
                setCode(newVal);
                setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; }, 0);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SubmissionsList({ questionId }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/coding/submissions', { params: { questionId } })
      .then(r => setSubs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [questionId]);

  if (loading) return <div className="loading"><div className="spinner" style={{ width: 24, height: 24 }} /></div>;

  if (subs.length === 0) return (
    <div className="empty-state" style={{ padding: '40px 0' }}>
      <div className="icon">📭</div>
      <h3>No submissions yet</h3>
      <p>Submit your first solution!</p>
    </div>
  );

  return (
    <div>
      {subs.map(sub => (
        <div key={sub._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className={`chip ${sub.status === 'accepted' ? 'chip-easy' : 'chip-hard'}`}>
              {sub.status === 'accepted' ? '✅ Accepted' : '❌ ' + sub.status.replace('-', ' ')}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(sub.submittedAt).toLocaleDateString()}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>⚡ {sub.runtime}ms</span>
            <span>💾 {(sub.memory / 1000).toFixed(1)}MB</span>
            <span className="tag">{sub.language}</span>
            <span>{sub.testCasesPassed}/{sub.totalTestCases} passed</span>
          </div>
        </div>
      ))}
    </div>
  );
}
