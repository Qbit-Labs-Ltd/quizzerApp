import React, { useState } from 'react';
import '../styles/CommonStyles.css';

const QuestionBlock = ({ question, onDeleteQuestion, onEditQuestion, onDeleteAnswer, isEditMode = false }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="question-block">
      <div className="question-header" onClick={() => setExpanded(!expanded)}>
        <div className="question-title-area">
          <h3 className="question-content">
            {expanded ? (
              <span className="expand-icon">▼</span>
            ) : (
              <span className="expand-icon">▶</span>
            )}
            {question.content}
          </h3>
          <span className={`difficulty difficulty-${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
        </div>

        <div className="question-actions">
          {onEditQuestion && (
            <button onClick={(e) => {
              e.stopPropagation();
              onEditQuestion(question.id);
            }} className="edit-btn">
              Edit
            </button>
          )}
          {onDeleteQuestion && (
            <button onClick={(e) => {
              e.stopPropagation();
              onDeleteQuestion(question.id);
            }} className="delete-btn danger">
              Delete
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="answer-options">
          <h4>Answer Options</h4>
          <ul className="answer-list">
            {question.answers && question.answers.length > 0 ? (
              question.answers.map((answer, index) => (
                <li
                  key={answer.id || index}
                  className={`answer-option ${answer.correct ? 'correct-answer' : ''}`}
                >
                  <span className="answer-text">{answer.text}</span>
                  {answer.correct && <span className="correct-indicator">✓</span>}

                  {/* Only show delete buttons in edit mode */}
                  {isEditMode && (
                    <button
                      type="button"
                      className="delete-answer-btn"
                      onClick={() => onDeleteAnswer(question.id, answer.id)}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))
            ) : (
              <p className="no-answers-message">No answer options added yet.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuestionBlock;