import React from 'react';
import '../styles/CommonStyles.css';

/**
 * Component for displaying a single answer option
 * Shows answer text with correct indicator and optional delete button
 * 
 * @param {Object} props - Component props
 * @param {string} props.answer - The answer text to display
 * @param {boolean} props.isCorrect - Whether this is the correct answer
 * @param {number} props.index - Index of this answer in the list
 * @param {Function} props.onDelete - Optional function to call when delete is clicked
 * @returns {JSX.Element}
 */
const AnswerOption = ({ answer, isCorrect, index, onDelete }) => {
  return (
    <div className={`answer-option ${isCorrect ? 'correct-answer' : ''}`}>
      {/* Answer text */}
      <span className="answer-text">{answer}</span>

      {/* Correct answer indicator */}
      {isCorrect && (
        <span className="correct-indicator" title="Correct Answer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      )}

      {/* Delete button - only shown if onDelete is provided */}
      {typeof onDelete === 'function' && (
        <button
          onClick={() => onDelete(index)}
          className="delete-answer-btn"
          aria-label="Delete answer option"
          title="Delete answer option"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default AnswerOption;
