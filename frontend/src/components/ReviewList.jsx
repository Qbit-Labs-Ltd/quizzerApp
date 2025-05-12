import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    // Optimistically update UI
    setData(prev => ({
      ...prev,
      reviews: prev.reviews.filter(r => r.id !== reviewId),
      total: prev.total - 1,
      avgRating: prev.reviews.length > 1 ? ((prev.avgRating * prev.total - prev.reviews.find(r => r.id === reviewId).rating) / (prev.total - 1)) : 0
    }));
    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      if (onDelete) onDelete(reviewId);
    } catch (err) {
      alert('Failed to delete review. Please try again.');
      // Optionally: refetch data or revert UI
      setLoading(true);
      axios.get(`/api/quizzes/${quizId}/reviews`)
        .then(res => setData(res.data))
        .catch(err => setError('Failed to reload reviews'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/quizzes/${quizId}/reviews`)
      .then(res => setData(res.data))
      .catch(err => {
        setError(err.response && err.response.status === 404 ? 'Quiz not found' : 'Failed to load reviews');
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <div>Loading reviews…</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data || data.total === 0) return <div>No reviews yet.</div>;

  return (
    <div className="review-list">
      <div className="review-list-header" style={{ marginBottom: 16 }}>
        <strong>Average rating:</strong> <StarRating value={data.avgRating} /> ({data.avgRating.toFixed(2)} / 5, {data.total} review{data.total !== 1 ? 's' : ''})
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data.reviews.map(r => (
          <li key={r.id} style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 12, padding: 12, background: '#fafbfc', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, marginRight: 8 }}>{r.nickname}</span>
              <span style={{ color: '#888', fontSize: '0.95em' }}>{formatDate(r.date)}</span>
              <span style={{ marginLeft: 'auto' }}><StarRating value={r.rating} /></span>
              <button
                title="Delete review"
                style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '1.3em' }}
                onClick={() => handleDelete(r.id)}
                aria-label="Delete review"
              >
                🗑️
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-line' }}>{r.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReviewList;
