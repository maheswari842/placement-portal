import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function AptitudeTest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId, questions = [] } = location.state || {};

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(questions.length * 60);
  const [submitting, setSubmitting] = useState(false);
  const [flagged, setFlagged] = useState(new Set());

  const submitTest = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
      const timeTaken = questions.length * 60 - timeLeft;
      await axios.post(`/api/aptitude/submit-test/${testId}`, { answers: answerArray, timeTaken });
      navigate(`/aptitude/result/${testId}`);
    } catch (err) {
      toast.error('Submission failed');
      setSubmitting(false);
    }
  }, [submitting, answers, questions.length, timeLeft, testId, navigate]);

  useEffect(() => {
    if (!testId || questions.length === 0) {
      navigate('/aptitude');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); submitTest(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testId, questions.length, navigate, submitTest]);

  if (!testId || questions.length === 0) return null;

  const current = questions[currentIdx];
  const answered = Object.keys(answers).length;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 120;

  const selectAnswer = (idx) => setAnswers({ ...answers, [current._id]: idx });
  const toggleFlag = () => {
    const nf = new Set(flagged);
    nf.has(currentIdx) ? nf.delete(currentIdx) : nf.add(currentIdx);
    setFlagged(nf);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar - Question navigator */}
      <div style={{ width: 240, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Question Navigator</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{answered}/{questions.length} answered</div>
        </div>
        <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {questions.map((q, i) => {
              const isAnswered = answers[q._id] !== undefined;
              const isCurrent = i === currentIdx;
              const isFlagged = flagged.has(i);
              return (
                <button key={i} onClick={() => setCurrentIdx(i)}
                  style={{
                    width: 36, height: 36, borderRadius: 6, border: '2px solid',
                    borderColor: isCurrent ? 'var(--accent-primary)' : isAnswered ? 'var(--accent-green)' : isFlagged ? 'var(--accent-yellow)' : 'var(--border)',
                    background: isCurrent ? 'rgba(99,102,241,0.2)' : isAnswered ? 'rgba(16,185,129,0.1)' : isFlagged ? 'rgba(245,158,11,0.1)' : 'var(--bg-card)',
                    color: isCurrent ? 'var(--accent-primary)' : isAnswered ? 'var(--accent-green)' : 'var(--text-muted)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: 4 }}>🟢 Answered &nbsp; ⬜ Not answered</div>
          <div>🟡 Flagged for review</div>
        </div>
      </div>

      {/* Main test area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '12px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontWeight: 600 }}>Aptitude Test</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: urgent ? 'var(--accent-red)' : 'var(--text-primary)', animation: urgent ? 'pulse 1s infinite' : 'none' }}>
              ⏱ {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            <button className="btn btn-danger btn-sm" onClick={submitTest} disabled={submitting}>
              {submitting ? 'Submitting...' : '🏁 Submit Test'}
            </button>
          </div>
        </div>

        {/* Question */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="chip chip-info">Q{currentIdx + 1} of {questions.length}</span>
                {current.category && <span className="chip chip-purple">{current.category}</span>}
                {current.difficulty && <span className={`chip chip-${current.difficulty}`}>{current.difficulty}</span>}
              </div>
              <button onClick={toggleFlag} style={{ background: 'none', border: 'none', color: flagged.has(currentIdx) ? 'var(--accent-yellow)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>
                {flagged.has(currentIdx) ? '🚩 Flagged' : '⚑ Flag'}
              </button>
            </div>

            <p style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 28, color: 'var(--text-primary)' }}>{current.question}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {current.options?.map((opt, i) => {
                const selected = answers[current._id] === i;
                return (
                  <div key={i} onClick={() => selectAnswer(i)}
                    style={{
                      padding: '14px 18px', borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${selected ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                      background: selected ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                      cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 14
                    }}
                    onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', border: `2px solid ${selected ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                      background: selected ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                      color: selected ? 'white' : 'var(--text-muted)'
                    }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 15 }}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation footer */}
        <div style={{ padding: '16px 32px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}>← Previous</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {answers[current._id] !== undefined && (
              <button className="btn btn-secondary btn-sm" onClick={() => { const a = { ...answers }; delete a[current._id]; setAnswers(a); }}>
                Clear Answer
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))} style={{ marginRight: 4 }}>
              Skip →
            </button>
          </div>
          {currentIdx < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}>Next →</button>
          ) : (
            <button className="btn btn-success" onClick={submitTest} disabled={submitting}>🏁 Submit Test</button>
          )}
        </div>
      </div>
    </div>
  );
}
