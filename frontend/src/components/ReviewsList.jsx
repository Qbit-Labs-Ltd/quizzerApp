import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReviewsByQuizId } from '../services/review';
import axios from 'axios';
import '../styles/CommonStyles.css';

/**
 * Displays a list of reviews for a specific quiz
 * 
 * @returns {JSX.Element}
 */
function ReviewsList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // Handle edit review
  const handleEdit = (reviewId) => {
    try {
      // Store the relationship between review ID and quiz ID before navigating
      const quizId = id;
      console.log(`Storing relationship: review ${reviewId} belongs to quiz ${quizId}`);
      localStorage.setItem(`review_${reviewId}_quizId`, quizId);

      // Double check the stored value to ensure it was saved correctly
      const storedQuizId = localStorage.getItem(`review_${reviewId}_quizId`);
      if (storedQuizId !== quizId) {
        console.error(`Failed to store quiz ID: expected ${quizId}, got ${storedQuizId}`);
        // Try again with a short timeout (sometimes localStorage writes can be delayed)
        setTimeout(() => {
          localStorage.setItem(`review_${reviewId}_quizId`, quizId);
          console.log('Retry localStorage write');
        }, 100);
      }

      // Also track this quiz in recent quizzes for improved lookup
      try {
        const recentQuizzes = JSON.parse(localStorage.getItem('recentQuizzes') || '[]');
        if (!recentQuizzes.includes(quizId)) {
          recentQuizzes.unshift(quizId); // Add to front
          if (recentQuizzes.length > 10) {
            recentQuizzes.pop(); // Remove oldest if more than 10
          }
          localStorage.setItem('recentQuizzes', JSON.stringify(recentQuizzes));
        }
      } catch (e) {
        console.error('Error updating recent quizzes:', e);
      }

      navigate(`/quiz/${quizId}/review?reviewId=${reviewId}`);
    } catch (err) {
      console.error('Error navigating to edit review:', err);
      alert('Could not open the review editor. Please try again.');
    }
  };
  // Handle delete review
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    // Keep a copy of the reviews for rollback if needed
    const previousReviews = [...reviews];

    try {
      // Optimistically update UI
      setReviews(reviews.filter(r => r.id !== reviewId));

      // Delete from server
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      await axios.delete(`${API_URL}/reviews/${reviewId}`);

      // Success - optionally show a success message
      console.log('Review deleted successfully');

    } catch (err) {
      console.error('Failed to delete review:', err);

      // Show error and restore previous state
      alert(err.response?.data?.message || 'Failed to delete review. Please try again.');

      // Restore the UI state with the previous reviews
      setReviews(previousReviews);

      // If the optimistic update failed badly, refetch everything
      if (!previousReviews) {
        fetchReviews();
      }
    }
  };
  // Extract fetchReviews to be able to call it again after deletion
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getReviewsByQuizId(Number(id));

      // Handle different response formats
      let reviewsArray = [];
      if (Array.isArray(data)) {
        reviewsArray = data;
      } else if (data && data.reviews && Array.isArray(data.reviews)) {
        reviewsArray = data.reviews;
      } else if (data) {
        console.warn('Unexpected reviews data format:', data);
      }

      setReviews(reviewsArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="loading">Loading reviews...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // Calculate average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings';

  // Generate stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="reviews-list-container">
      <div className="reviews-header">
        <h2>Reviews</h2>
        <div className="reviews-summary">
          <span>{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}</span>
          <span className="average-rating">
            Average Rating: {averageRating}
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet.</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map(review => (<div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-name">{review.nickname}</div>
              <div className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="review-rating">
              {renderStars(review.rating)}
            </div>
            {review.text && (
              <div className="review-comment">
                {review.text}
              </div>
            )}
            <div className="review-actions">
              <button
                className="edit-review-btn"
                onClick={() => handleEdit(review.id)}
                aria-label="Edit review"
              >
                Edit
              </button>
              <button
                className="delete-review-btn"
                onClick={() => handleDelete(review.id)}
                aria-label="Delete review"
              >
                Delete
              </button>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsList; 