import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define API_URL constant
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function StarRating({ value, max = 5 }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span aria-label={`Rating: ${rounded} out of ${max}`} style={{ color: '#f5c518', fontSize: '1.4em' }}>
      {[...Array(max)].map((_, i) => {
        if (rounded >= i + 1) return <span key={i}>★</span>;
        if (rounded >= i + 0.5) return <span key={i}>☆</span>;
        return <span key={i} style={{ color: '#ccc' }}>★</span>;
      })}
    </span>
  );
}

function ReviewList({ quizId, onDelete }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Optimistic delete handler
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    // Save the current state for potential rollback
    const prevData = data;
    let deletedReview = null;

    // Get the review being deleted for rollback if needed
    if (prevData && prevData.reviews) {
      deletedReview = prevData.reviews.find(r => r.id === reviewId);
    }

    // Optimistically update UI
    setData(prev => {
      // Handle both response formats
      if (!prev) return null;

      if (prev.reviews) {
        // Object with reviews array format
        return {
          ...prev,
          reviews: prev.reviews.filter(r => r.id !== reviewId),
          total: prev.total - 1,
          avgRating: prev.reviews.length > 1 ?
            ((prev.avgRating * prev.total - prev.reviews.find(r => r.id === reviewId).rating) / (prev.total - 1)) :
            0
        };
      } else {
        // Direct array format
        const newReviews = prev.filter(r => r.id !== reviewId);
        const avgRating = newReviews.length ?
          newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length :
          0;

        return {
          reviews: newReviews,
          total: newReviews.length,
          avgRating: avgRating
        };
      }
    });

    try {
      await axios.delete(`${API_URL}/reviews/${reviewId}`);
      if (onDelete) onDelete(reviewId);
    } catch (err) {
      console.error('Failed to delete review:', err);

      // Show error message with more details if available
      alert(err.response?.data?.message || 'Failed to delete review. Please try again.');

      // Restore the previous state
      setData(prevData);

      // If we can't restore the state correctly, refetch everything
      if (!prevData || !deletedReview) {
        fetchReviews();
      }
    }
  };
  const fetchReviews = () => {
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/quizzes/${quizId}/reviews`)
      .then(res => {
        // Handle different response formats
        const responseData = res.data;
        if (Array.isArray(responseData)) {
          setData({
            reviews: responseData,
            total: responseData.length,
            avgRating: responseData.length ?
              responseData.reduce((sum, r) => sum + (r.rating || 0), 0) / responseData.length :
              0
          });
        } else if (responseData && responseData.reviews) {
          setData(responseData);
        } else if (responseData) {
          // Handle unexpected but valid response format
          console.warn('Unexpected response format:', responseData);
          // Try to adapt to the format
          const reviews = Array.isArray(responseData) ?
            responseData :
            (Array.isArray(responseData.reviews) ? responseData.reviews : []);

          setData({
            reviews: reviews,
            total: reviews.length,
            avgRating: reviews.length ?
              reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length :
              0
          });
        } else {
          // Handle empty response
          setData({
            reviews: [],
            total: 0,
            avgRating: 0
          });
        }
      })
      .catch(err => {
        console.error('Error loading reviews:', err);
        setError(err.response && err.response.status === 404 ?
          'Quiz not found' :
          (err.response?.data?.message || 'Failed to load reviews'));
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);
  if (loading) return <div>Loading reviews…</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div>No reviews yet.</div>;

  // Check if there are any reviews to display
  const reviews = data.reviews || [];
  const total = data.total || reviews.length || 0;
  const avgRating = data.avgRating || (reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0);

  if (total === 0) return <div>No reviews yet.</div>;

  return (
    <div className="review-list">
      <div className="review-list-header" style={{ marginBottom: 16 }}>
        <strong>Average rating:</strong> <StarRating value={avgRating} /> ({avgRating.toFixed(2)} / 5, {total} review{total !== 1 ? 's' : ''})
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {reviews.map(r => (
          <li key={r.id} style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 12, padding: 12, background: '#fafbfc', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, marginRight: 8 }}>{r.nickname}</span>
              <span style={{ color: '#888', fontSize: '0.95em' }}>{formatDate(r.date)}</span>
              <span style={{ marginLeft: 'auto' }}><StarRating value={r.rating} /></span>
              <div style={{ display: 'flex', gap: '8px' }}>                <button
                title="Edit review"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a90e2', fontSize: '1.2em' }} onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Store the relationship before navigating
                  console.log(`Storing relationship: review ${r.id} belongs to quiz ${quizId}`);
                  localStorage.setItem(`review_${r.id}_quizId`, quizId.toString());

                  // Double check the stored value to ensure it was saved correctly
                  const storedQuizId = localStorage.getItem(`review_${r.id}_quizId`);
                  if (storedQuizId !== quizId.toString()) {
                    console.error(`Failed to store quiz ID: expected ${quizId}, got ${storedQuizId}`);

                    // Try again with a short timeout (sometimes localStorage writes can be delayed)
                    setTimeout(() => {
                      localStorage.setItem(`review_${r.id}_quizId`, quizId.toString());
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

                  window.location.href = `/quiz/${quizId}/review?reviewId=${r.id}`;
                }}
                aria-label="Edit review"
              >
                ✏️
              </button>
                <button
                  title="Delete review"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '1.3em' }}
                  onClick={() => handleDelete(r.id)}
                  aria-label="Delete review"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="review-content">{r.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReviewList;
