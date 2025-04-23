import React from 'react';
import QuestionView from './QuestionView';

/**
 * Component for displaying all questions in a quiz with a read-only view
 * Used to preview the full content of a quiz
 * 
 * @param {Object} props - Component props
 * @param {Object} props.quiz - Quiz object containing title and questions array
 * @returns {JSX.Element}
 */
const QuizQuestionList = ({ quiz }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Quiz title */}
      <h2 style={{ fontWeight: '600' }}>{quiz.title}</h2>

      {/* Map through and display each question */}
      {quiz.questions.map((q, idx) => (
        <div key={idx} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '6px' }}>
          <QuestionView question={q} />
        </div>
      ))}
    </div>
  );
};

export default QuizQuestionList;
