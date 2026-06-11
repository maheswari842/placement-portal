import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function AptitudeResult() {
  const { testId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Get from history
        const { data } = await axios.get('/api/aptitude/history');
        const test = data.find(t => t._id === testId);
        if (test) setResult(test);
      } catch (e) {}
      setLoading(false);
    };
    fetchResult();
  }, [testId]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const pct = result?.percentage || 0;
  const grade = pct >= 90 ? { label: 'Excellent', color: '#10b981', emoji: '🏆' }
    : pct >= 75 ? { label: 'Very Good', color: '#6366f1', emoji: '🌟' }
    : pct >= 60 ? { label: 'Good', color: '#3b82f6', emoji: '👍' }
    : pct >= 40 ? { label: 'Average', color: '#f59e0b', emoji: '📚' }
    : { label: 'Needs Work', color: '#ef4444', emoji: '💪' };

  return (
    <div>
      <div className="page-header">
        <h2>Test Results</h2>
        <p>Here's how you performed</p>
      </div>

      <div className="page-body">
        {result ? (
          <>
            {/* Score card */}
            <div className="card fade-in" style={{ textAlign: 'center', padding: 40, marginBottom: 24 }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>{grade.emoji}</div>
              <div style={{ fontSize: 72, fontWeight: 800, color: grade.color, fontFamily: 'var(--font-mono)' }}>{pct}%</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: grade.color, marginBottom: 8 }}>{grade.label}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                {result.correctAnswers} out of {result.totalQuestions} correct
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
                {[
                  { label: 'Score', value: result.score + ' pts' },
                  { label: 'Time Taken', value: Math.floor((result.timeTaken || 0) / 60) + ' min' },
                  { label: 'Correct', value: result.correctAnswers },
                  { label: 'Wrong', value: result.totalQuestions - result.correctAnswers }
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ width: '60%', margin: '24px auto 0' }}>
                <div className="progress-bar" style={{ height: 10 }}>
                  <div className={`progress-fill ${pct >= 60 ? 'green' : pct >= 40 ? 'yellow' : 'red'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <Link to="/aptitude" className="btn btn-primary">🔄 Take Another Test</Link>
              <button className="btn btn-secondary" onClick={() => setShowReview(!showReview)}>
                {showReview ? '📋 Hide Review' : '📋 Review Answers'}
              </button>
              <Link to="/progress" className="btn btn-secondary">📊 View Progress</Link>
            </div>

            {/* Answer review */}
            {showReview && result.questions && (
              <div className="card fade-in">
                <div className="card-header">
                  <span className="card-title">Answer Review</span>
                </div>
                {result.questions.map((q, i) => (
                  <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)', minWidth: 24 }}>{i + 1}.</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, marginBottom: 12 }}>{q.question?.question}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {q.question?.options?.map((opt, oi) => {
                            const isCorrect = oi === q.question.correctAnswer;
                            const isSelected = oi === q.selectedAnswer;
                            return (
                              <div key={oi} style={{
                                padding: '8px 14px', borderRadius: 6,
                                background: isCorrect ? 'rgba(16,185,129,0.1)' : isSelected ? 'rgba(239,68,68,0.1)' : 'var(--bg-secondary)',
                                border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.4)' : isSelected ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                                color: isCorrect ? 'var(--accent-green)' : isSelected ? 'var(--accent-red)' : 'var(--text-secondary)',
                                fontSize: 14, display: 'flex', alignItems: 'center', gap: 8
                              }}>
                                {isCorrect ? '✅' : isSelected ? '❌' : ''} {opt}
                              </div>
                            );
                          })}
                        </div>
                        {q.question?.explanation && (
                          <div style={{ marginTop: 10, padding: 12, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, fontSize: 13, color: 'var(--accent-blue)' }}>
                            💡 {q.question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="icon">📊</div>
            <h3>Result not found</h3>
            <p>This test result may have expired or doesn't exist.</p>
            <Link to="/aptitude" className="btn btn-primary" style={{ marginTop: 16 }}>Go Back</Link>
          </div>
        )}
      </div>
    </div>
  );
}
