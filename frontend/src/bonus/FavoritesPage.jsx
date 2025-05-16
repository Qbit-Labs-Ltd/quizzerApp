import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFavorites from '../bonus/useFavorites';
import QuizListService from '../utils/QuizListService';
import '../styles/CommonStyles.css';
import '../styles/Quizzes.css';

/**
 * Component that displays a list of favorite quizzes
 * @returns {JSX.Element}
 */
const FavoritesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();
  

  // Fetch all quizzes and filter favorites
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        // Get all published quizzes
        const allQuizzes = await QuizListService.getPublishedQuizzes();
        // Filter only favorites
        const favoriteQuizzes = allQuizzes.filter(quiz => favorites.includes(quiz.id));
        setQuizzes(favoriteQuizzes);
        setError(null);
      } catch (err) {
        console.error("Error fetching favorite quizzes:", err);
        setError('Failed to load favorite quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [favorites]);

  // Handle taking a quiz
  const handleTakeQuiz = (id) => {
    navigate(`/quizzes/${id}/take`);
  };

  // Show loading indicator when data is being fetched
  if (loading) return <div className="loading">Loading favorite quizzes...</div>;

  // Show error state when fetching fails
  if (error) return <div className="error-message">{error}</div>;

  // Show empty state when no favorite quizzes are available
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="empty-state">
        <h2>No favorite quizzes</h2>
        <p>Add quizzes to your favorites to see them here!</p>
      </div>
    );
  }

  return (
    <div className="quizzes-container">
      <div className="page-title-container">
        <h1 className="page-title">Favorite Quizzes</h1>
      </div>

      <div className="quiz-cards-grid">
        {quizzes.map(quiz => (
          <div key={`quiz-container-${quiz.id}`} className="quiz-card">
            <div className="quiz-card-header">
              <h2 className="quiz-card-title">{quiz.name}</h2>
              <span
                className={"favorite-heart favorited"}
                style={{ cursor: 'pointer'}}
                onClick={() => toggleFavorite(quiz.id)}
                title="Remove from favorites"
              >
                ♥
              </span>
              <div className="quiz-card-badge">
                {quiz.published && <span className="published-badge">Published</span>}
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
            </div>

            <div className="quiz-card-actions">
              <button
                className="take-quiz-btn"
                onClick={() => handleTakeQuiz(quiz.id)}
              >
                Take Quiz
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
