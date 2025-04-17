import React from 'react';
import QuestionView from './QuestionView';

const QuizQuestionList = ({ quiz }) => {
  return (
    <div>
      <h2>{quiz.title}</h2>
      {quiz.questions.map((q, idx) => (
        <QuestionView key={idx} question={q} />
      ))}
    </div>
  );
};

export default QuizQuestionList;
