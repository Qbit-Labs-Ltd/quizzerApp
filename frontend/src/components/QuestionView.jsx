import React from 'react';
import AnswerOption from './AnswerOption';

/**
 * Component for displaying a question and its answer options
 * Used for read-only display of question content
 * 
 * @param {Object} props - Component props
 * @param {Object} props.question - The question data to display
 * @param {Function} props.onDeleteAnswer - Optional callback for deleting answers
 * @returns {JSX.Element}
 */
const QuestionView = ({ question, onDeleteAnswer }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Question text */}
      <h3 style={{ marginBottom: '0.5rem' }}>{question.text}</h3>

      {/* List of answer options */}
      <div style={{ paddingLeft: '1rem' }}>
        {question.answers.map((ans, idx) => (
          <AnswerOption
            key={idx}
            answer={ans}
            index={idx}
            onDelete={onDeleteAnswer ? () => onDeleteAnswer(idx) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionView;
