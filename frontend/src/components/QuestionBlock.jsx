import React, { useState } from 'react';
import '../styles/CommonStyles.css';
import '../styles/Question.css';

/**
 * Component for displaying a question with its details and answer options
 * Provides expandable/collapsible view and action buttons for editing/deleting
 * 
 * @param {Object} props - Component props
 * @param {Object} props.question - Question data to display
 * @param {Function} props.onDeleteQuestion - Function called when delete button clicked
 * @param {Function} props.onEditQuestion - Function called when edit button clicked
 * @param {Function} props.onDeleteAnswer - Function called when an answer is deleted
 * @param {boolean} props.isEditMode - Whether the component is being used in edit mode
 * @returns {JSX.Element}
 */
const QuestionBlock = ({ question, onDeleteQuestion, onEditQuestion, onDeleteAnswer, isEditMode = false }) => {
  // State to track if question details are expanded or collapsed
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="question-block">
      {/* Question header with expand/collapse control */}
      <div className="question-header" onClick={() => setExpanded(!expanded)}>
        <div className="question-title-area">
          <h3 className="question-content">
            {/* Toggle icon based on expanded state */}
            {expanded ? (
              <span className="expand-icon">▼</span>
            ) : (
              <span className="expand-icon">▶</span>
            )}
            {question.content}
          </h3>
          {/* Difficulty badge */}
          <span className={`difficulty difficulty-${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
        </div>

        {/* Action buttons */}
        <div className="question-actions">
          {onEditQuestion && (
            <button onClick={(e) => {
              e.stopPropagation(); // Prevent triggering expand/collapse
              onEditQuestion(question.id);
            }} className="edit-btn">
              Edit
            </button>
          )}
          {onDeleteQuestion && (
            <button onClick={(e) => {
              e.stopPropagation(); // Prevent triggering expand/collapse
              onDeleteQuestion(question.id);
            }} className="delete-btn danger">
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Expandable answer options section */}
      {expanded && (
        <div className="answer-options">
          <h4>Answer Options:</h4>
          <ul className="answers-list">
            {question.answers.map(answer => (
              <li key={answer.id} className={answer.correct ? 'correct-answer' : ''}>
                {answer.text}
                {answer.correct && <span className="correct-badge"> ✓ Correct</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuestionBlock;