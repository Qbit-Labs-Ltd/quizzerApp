import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import QuestionBlock from '../components/QuestionBlock';
import ReviewsList from '../components/ReviewsList';
import { questionApi, quizApi } from '../utils/api';
import '../styles/CommonStyles.css';
import '../styles/Quizzes.css';
import '../styles/Review.css';

/**
 * Student-facing page that shows a quiz with all its questions.
 * URL: /quiz/:id
 * Now supports tabs for quiz content and reviews
 */
export default function QuizPage() {
  const { id } = useParams();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine active tab from query params or default to 'quiz'
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'quiz';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizRes, questionRes] = await Promise.all([
          quizApi.getById(id),
          questionApi.getByQuizId(id)
        ]);
        setQuiz(quizRes);
        setQuestions(questionRes);
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading" role="status" aria-live="polite">Loading quiz…</div>;
  if (error) return <div className="error-message" role="alert">{error}</div>;
  if (!quiz) return <div className="error-message" role="alert">Quiz not found</div>;

  return (
    <div className="quiz-page" aria-labelledby="quiz-title">
      <h1 id="quiz-title" className="quiz-title">{quiz.name}</h1>
      {quiz.description && <p className="quiz-description">{quiz.description}</p>}

      {/* Tab navigation */}
      <div className="tabs-container">
        <div className="tabs-header">
          <Link
            to={`/quiz/${id}`}
            className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
          >
            Quiz Content
          </Link>
          <Link
            to={`/quiz/${id}?tab=reviews`}
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            Reviews
          </Link>
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {activeTab === 'quiz' ? (
            questions.length === 0 ? (
              <p>No questions in this quiz yet.</p>
            ) : (
              questions.map(q => (
                <QuestionBlock key={q.id} question={q} />
              ))
            )
          ) : (
            <ReviewsList />
          )}
        </div>
      </div>

      {/* Page footer with WriteReviewButton */}
      <div className="quiz-page-footer">
        <Link
          to={`/quiz/${id}/review`}
          className="btn btn-primary write-review-btn"
          aria-label="Write a review for this quiz"
        >
          Write a Review
        </Link>
      </div>

      <style jsx="true">{`
        .quiz-page-footer {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          padding: 20px 0;
          border-top: 1px solid #e0e0e0;
        }
        
        .write-review-btn {
          background-color: #4a90e2;
          color: white;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: background-color 0.2s;
        }
        
        .write-review-btn:hover {
          background-color: #3a7bc8;
          text-decoration: none;
          color: white;
        }
        
        .write-review-btn::before {
          content: "★";
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
}
