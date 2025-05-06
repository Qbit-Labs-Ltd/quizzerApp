import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { quizApi } from '../utils/api';
import '../styles/CommonStyles.css';

/**
 * Results page shows per-question statistics for a quiz.
 * Route: /quiz/:id/results
 */
export default function ResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [quizName, setQuizName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizMeta, res] = await Promise.all([
          quizApi.getById(id),
          quizApi.getResults(id)
        ]);
        setQuizName(quizMeta.name);
        setResults(res);
      } catch (err) {
        console.error(err);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading" role="status" aria-live="polite">Loading results…</div>;
  if (error) return <div className="error-message" role="alert">{error}</div>;

  return (
    <div className="results-page">
      <h1 className="page-title">Results for {quizName}</h1>

      <table className="results-table" aria-label="Quiz results summary">
        <thead>
          <tr>
            <th>Question</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r => {
            const total = r.correctCount + r.wrongCount;
            const pct = total === 0 ? 0 : Math.round((r.correctCount / total) * 100);
            return (
              <tr key={r.questionId}>
                <td>{r.content}</td>
                <td><span className="chip chip-correct">✓ {r.correctCount}</span></td>
                <td><span className="chip chip-wrong">✗ {r.wrongCount}</span></td>
                <td>
                  <div className="pct-bar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
                    <div className="pct-bar-inner" style={{ width: `${pct}%` }} />
                    <span className="pct-label">{pct}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
