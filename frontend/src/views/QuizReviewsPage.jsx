import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewList from '../components/ReviewList';

export default function QuizReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate(); const [quizTitle, setQuizTitle] = useState('');
  // Set quiz title
  useEffect(() => {
    setQuizTitle('Quiz Reviews');
  }, []);

  const handleBackToQuizzes = () => {
    navigate('/quizzes/published');
  };

  const handleAddReview = () => {
    navigate(`/quiz/${id}/review`);
  };

  return (
    <div className="quiz-reviews-page" style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>{quizTitle}</h1>
      <div className="review-actions" style={{ marginBottom: '20px' }}>
        <button
          onClick={handleAddReview}
          className="add-review-button"
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Add Review
        </button>      </div>

      <ReviewList quizId={id} />

      <div className="review-page-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
        <button
          className="back-button"
          onClick={handleBackToQuizzes}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
}
