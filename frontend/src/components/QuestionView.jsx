import React from 'react';
import AnswerOption from './AnswerOption';

const QuestionView = ({ question, onDeleteAnswer }) => {
  return (
    <div>
      <h3>{question.text}</h3>
      {question.answers.map((ans, idx) => (
        <AnswerOption
          key={idx}
          answer={ans}
          index={idx}
          onDelete={onDeleteAnswer}
        />
      ))}
    </div>
  );
};

export default QuestionView;
