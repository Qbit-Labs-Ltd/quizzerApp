import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { categoryApi } from '../utils/api';
import QuizCard from '../components/QuizCard';
import '../styles/CommonStyles.css';
import '../styles/Category.css';

/**
 * Displays all quizzes that belong to a category (published by default).
 * Route: /categories/:id
 */
export default function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const list = await categoryApi.getQuizzes(id, true);
        setQuizzes(list);
      } catch (err) {
        console.error(err);
        setError('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [id]);

  if (loading) return <div className="loading" role="status" aria-live="polite">Loading quizzes…</div>;
  if (error) return <div className="error-message" role="alert">{error}</div>;

  return (
    <div className="category-detail-page">
      <nav aria-label="Breadcrumb" className="breadcrumb-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
      </nav>

      <h1 className="page-title">Category {id} Quizzes</h1>

      {quizzes.length === 0 ? (
        <p>No quizzes available in this category.</p>
      ) : (
        <div className="quiz-cards-grid">
          {quizzes.map(q => (
            <QuizCard key={q.id} quiz={q} />
          ))}
        </div>
      )}

      <div className="button-row">
        <Link to="/">Home</Link>
      </div>
    </div>
  );
}
