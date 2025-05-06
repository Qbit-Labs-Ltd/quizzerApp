import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CardStyles.css';

/**
 * Presentational component that renders a single quiz in a card.
 * Re-used by QuizList and CategoryDetailPage.
 */
export default function QuizCard({ quiz, onEdit, onDelete, onViewQuestions }) {
  const navigate = useNavigate();

  // Fallback actions if not provided
  const handleView = () => {
    if (onViewQuestions) return onViewQuestions(quiz.id);
    navigate(`/quiz/${quiz.id}`);
  };

  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        <h2 className="quiz-card-title" onClick={handleView}>{quiz.name}</h2>
        <div className="quiz-card-badge">
          {quiz.published ? (
            <span className="published-badge">Published</span>
          ) : (
            <span className="not-published-badge">Not published</span>
          )}
        </div>
      </div>

      <div className="quiz-card-content">
        <p className="quiz-card-description">{quiz.description || 'No description'}</p>
        <div className="quiz-card-details">
          <span className="quiz-card-course">Course: {quiz.courseCode}</span>
          <span className="quiz-card-date">Added: {new Date(quiz.dateAdded || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="quiz-card-actions">
          {onViewQuestions && (
            <button className="view-questions-btn" onClick={() => onViewQuestions(quiz.id)}>View Questions</button>
          )}
          <div className="card-action-buttons">
            {onEdit && <button className="edit-btn" onClick={() => onEdit(quiz.id)}>Edit</button>}
            {onDelete && <button className="delete-btn danger" onClick={() => onDelete(quiz.id)}>Delete</button>}
          </div>
        </div>
      )}
    </div>
  );
}
