import React from 'react';
import QuestionView from './QuestionView';

const QuizQuestionList = ({ quiz }) => {
  return (
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
  <h2 style={{ fontWeight: '600' }}>{quiz.title}</h2>
  {quiz.questions.map((q, idx) => (
    <div key={idx} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '6px' }}>
      <QuestionView question={q} />
    </div>
  ))}
</div>

  );
};

export default QuizQuestionList;
