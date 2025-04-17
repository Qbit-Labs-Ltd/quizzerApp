import React from 'react';

const AnswerOption = ({ answer, index, onDelete }) => {
  return (
    <div className="answer-option">
      <span>{answer}</span>
      <button onClick={() => onDelete(index)}>🗑️</button>
    </div>
  );
};

export default AnswerOption;
