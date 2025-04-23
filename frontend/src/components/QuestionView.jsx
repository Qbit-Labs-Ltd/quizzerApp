import React from 'react';
import AnswerOption from './AnswerOption';

const QuestionView = ({ question, onDeleteAnswer }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>{question.text}</h3>

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
