import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizListService from '../utils/QuizListService';
import '../styles/CommonStyles.css';
import '../styles/Quizzes.css';

/**
 * Component that displays a list of published quizzes
 * Users can view and take quizzes from this page
 * 
 * @returns {JSX.Element}
 */
const QuizListPage = () => {
  const [publishedQuizzes, setPublishedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const navigate = useNavigate();

  // Fetch published quizzes when component mounts
  useEffect(() => {
    const fetchPublishedQuizzes = async () => {
      try {
        setLoading(true);
        const data = await QuizListService.getPublishedQuizzes();
        setPublishedQuizzes(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching published quizzes:", err);
        setError('Failed to load published quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedQuizzes();
  }, []);

  // Handle taking a quiz
  const handleTakeQuiz = (id) => {
    navigate(`/quizzes/${id}/take`);
  };

  // Show loading indicator when data is being fetched
  if (loading) return <div className="loading">Loading published quizzes...</div>;

  // Show error state when fetching fails
  if (error) return <div className="error-message">{error}</div>;

  // Show empty state when no published quizzes are available
  if (!publishedQuizzes || publishedQuizzes.length === 0) {
    return (
      <div className="empty-state">
        <h2>No published quizzes available</h2>
        <p>Check back later for new quizzes!</p>
      </div>
    );
  }

  return (
    <div className="quizzes-container">
      <div className="page-title-container">
        <h1 className="page-title">Available Quizzes</h1>
      </div>

      <div className="view-toggle">
        <button
          className={viewMode === 'card' ? 'active' : ''}
          onClick={() => setViewMode('card')}
        >
          Card View
        </button>
        <button
          className={viewMode === 'table' ? 'active' : ''}
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
      </div>

      {viewMode === 'card' ? (
        <div className="quiz-cards-grid">
          {publishedQuizzes.map(quiz => (
            <div key={`quiz-container-${quiz.id}`} className="quiz-card">
              <div className="quiz-card-header">
                <h2 className="quiz-card-title">{quiz.name}</h2>
                <div className="quiz-card-badge">
                  <span className="published-badge">Published</span>
                </div>
              </div>

              <div className="quiz-card-content">
                <p className="quiz-card-description">{quiz.description || "No description"}</p>
                <div className="quiz-card-details">
                  <div className="detail-item">
                    <span className="detail-label">Course</span>
                    <span className="detail-value">{quiz.courseCode}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{quiz.categoryName || "None"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Questions</span>
                    <span className="detail-value">{quiz.questionCount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Added</span>
                    <span className="detail-value">
                      {new Date(quiz.dateAdded || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>              <div className="quiz-card-actions">
                <div className="quiz-card-action-row">
                  <button
                    className="take-quiz-btn"
                    onClick={() => handleTakeQuiz(quiz.id)}
                  >
                    Take Quiz
                  </button>
                  <button
                    className="view-reviews-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/quiz/${quiz.id}/reviews`);
                    }}
                  >
                    View Reviews
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="quiz-table-container">
          <table className="quiz-table">
            <thead>
              <tr>
                <th>Quiz Name</th>                <th>Course Code</th>
                <th>Description</th>
                <th>Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {publishedQuizzes.map(quiz => (
                <tr key={`quiz-row-${quiz.id}`}>
                  <td>{quiz.name}</td>
                  <td>{quiz.courseCode}</td>
                  <td>{quiz.description || "No description"}</td>
                  <td>{quiz.questionCount}</td>
                  <td>                    <div className="table-actions">
                    <button
                      className="take-quiz-btn primary small"
                      onClick={() => handleTakeQuiz(quiz.id)}
                    >
                      Take Quiz
                    </button>
                    <button
                      className="view-reviews-btn small"
                      onClick={() => navigate(`/quiz/${quiz.id}/reviews`)}
                    >
                      Reviews
                    </button>
                  </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuizListPage;