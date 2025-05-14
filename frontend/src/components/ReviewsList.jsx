import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getReviewsByQuizId } from '../services/review';
import '../styles/CommonStyles.css';

/**
 * Displays a list of reviews for a specific quiz
 * 
 * @returns {JSX.Element}
 */
function ReviewsList() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getReviewsByQuizId(Number(id));
        // Handle both array and object response formats
        const reviewsArray = Array.isArray(data) ? data : (data.reviews || []);
        setReviews(reviewsArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
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
          {reviews.map(review => (
            <div key={review.id} className="review-card">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsList; 