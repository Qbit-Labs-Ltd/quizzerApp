import React from 'react';
import { useParams } from 'react-router-dom';
import ReviewList from '../components/ReviewList';

export default function QuizReviewsPage() {
  const { id } = useParams();
  return (
    <div className="quiz-reviews-page" style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>Quiz Reviews</h1>
      <ReviewList quizId={id} />
    </div>
  );
}
