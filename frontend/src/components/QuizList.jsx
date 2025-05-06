import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/CommonStyles.css';

/**
 * Component that displays a list of quizzes in a card layout
 * Provides functionality to view, edit, and delete quizzes
 * 
 * @param {Object} props - Component props
 * @param {Array} props.quizzes - Array of quiz objects to display
 * @param {Function} props.onEdit - Function called when edit button is clicked
 * @param {Function} props.onDelete - Function called when delete button is clicked
 * @param {Function} props.onViewQuestions - Function called when view questions is clicked
 * @param {boolean} props.loading - Whether quizzes are loading
 * @returns {JSX.Element}
 */
const QuizList = ({ quizzes, onEdit, onDelete, onViewQuestions, loading }) => {
  const navigate = useNavigate();

  // Show loading indicator when data is being fetched
  if (loading) return <div className="loading">Loading quizzes...</div>;

  // Show empty state when no quizzes are available
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="empty-state">
        <h2>No quizzes available</h2>
        <p>Create your first quiz to get started!</p>
      </div>
    );
  }

  /**
   * Handles edit button click
   * @param {number} id - ID of the quiz to edit
   */
  const handleEdit = (id) => {
    navigate(`/quizzes/${id}/edit`);
  };

  /**
   * Handles view questions button click
   * @param {number} id - ID of the quiz to view questions for
   */
  const handleViewQuestions = (id) => {
    navigate(`/quizzes/${id}/questions`);
  };

  // Create a Map to track seen IDs and ensure uniqueness
  const seenIds = new Map();
  const uniqueQuizzes = quizzes.filter(quiz => {
    if (!quiz.id || seenIds.has(quiz.id)) {
      return false; // Skip duplicates or items without IDs
    }
    seenIds.set(quiz.id, true);
    return true;
  });

  return (
    <div className="quizzes-container">
      <h1 className="page-title">Quizzes</h1>

      <div className="quiz-cards-grid">
        {uniqueQuizzes.map(quiz => (
          <div key={`quiz-${quiz.id}-${quiz.name}`} className="quiz-card">
            <div className="quiz-card-header">
              <h2 className="quiz-card-title" onClick={() => handleViewQuestions(quiz.id)}>
                {quiz.name}
              </h2>
              <div className="quiz-card-badge">
                {quiz.published ? (
                  <span className="published-badge">Published</span>
                ) : (
                  <span className="not-published-badge">Not published</span>
                )}
              </div>
            </div>

            <div className="quiz-card-content">
              <p className="quiz-card-description">{quiz.description || "No description"}</p>
              <div className="quiz-card-details">
                <span className="quiz-card-course">Course: {quiz.courseCode}</span>
                <span className="quiz-card-category">Category: {quiz.categoryName || "None"}</span>
                <span className="quiz-card-date">Added: {new Date(quiz.dateAdded || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="quiz-card-actions">
              <button
                className="view-questions-btn"
                onClick={() => handleViewQuestions(quiz.id)}
              >
                View Questions
              </button>
              <div className="card-action-buttons">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(quiz.id)}
                >
                  Edit
                </button>
                {onDelete && (
                  <button
                    className="delete-btn danger"
                    onClick={() => onDelete(quiz.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="button-row">
        <Link to="/quizzes/new" className="add-quiz-link">
          Add a quiz
        </Link>
      </div>
    </div>
  );
};

export default QuizList;