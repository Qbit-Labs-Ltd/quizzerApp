import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createReview, getReviewById, updateReview } from '../services/review';
import '../styles/CommonStyles.css';
import RadioGroup from './RadioGroup';

/**
 * Form component for submitting or editing quiz reviews
 * Includes nickname input, 5-star rating, and comment textarea
 * Supports both create and edit modes based on URL parameters
 * 
 * @returns {JSX.Element}
 */
function ReviewForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Parse query parameters to determine if we're in edit mode
  const queryParams = new URLSearchParams(location.search);
  const reviewId = queryParams.get('reviewId');
  const isEditMode = !!reviewId;
  
  // Form state
  const [formState, setFormState] = useState({
    nickname: '',
    rating: 0,
    comment: ''
  });

  // Rating options for the RadioGroup
  const ratingOptions = [
    { id: 1, label: '1 ★', value: 1 },
    { id: 2, label: '2 ★', value: 2 },
    { id: 3, label: '3 ★', value: 3 },
    { id: 4, label: '4 ★', value: 4 },
    { id: 5, label: '5 ★', value: 5 }
  ];
  
  // Fetch review data if in edit mode
  useEffect(() => {
    const fetchReview = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const reviewData = await getReviewById(reviewId);
        
        // Pre-fill form with review data
        setFormState({
          nickname: reviewData.nickname || '',
          rating: reviewData.rating || 0,
          comment: reviewData.comment || ''
        });
      } catch (err) {
        console.error('Error fetching review:', err);
        setError('Failed to load review data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReview();
  }, [reviewId, isEditMode]);

  // Update form state on input change
  const handleChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle rating change separately since it comes from RadioGroup
  const handleRatingChange = (value) => {
    setFormState(prev => ({
      ...prev,
      rating: value
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate inputs
    if (!formState.nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    if (!formState.rating) {
      setError('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      if (isEditMode) {
        // Update existing review
        await updateReview(reviewId, {
          quizId: Number(id),
          nickname: formState.nickname,
          rating: formState.rating,
          comment: formState.comment
        });
      } else {
        // Create new review
        await createReview({
          quizId: Number(id),
          nickname: formState.nickname,
          rating: formState.rating,
          comment: formState.comment
        });
      }

      // On success, navigate back to quiz page with reviews tab
      navigate(`/quiz/${id}?tab=reviews`);
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} review:`, err);
      setError(`Failed to ${isEditMode ? 'update' : 'submit'} review. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel and go back to quiz page
  const handleCancel = () => {
    navigate(`/quiz/${id}?tab=reviews`);
  };
  
  // Show loading indicator
  if (loading) {
    return <div className="loading">Loading review data...</div>;
  }

  return (
    <div className="review-form-container">
      <h2>{isEditMode ? 'Edit Review' : 'Submit a Review'}</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="review-nickname">Your Name</label>
          <input
            type="text"
            id="review-nickname"
            name="nickname"
            value={formState.nickname}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="Enter your name or nickname"
          />
        </div>

        <div className="form-group">
          <label>Rating</label>
          <RadioGroup
            options={ratingOptions}
            name="rating"
            selectedValue={formState.rating}
            onChange={handleRatingChange}
            disabled={isSubmitting}
          />
          <div className="rating-explanation"></div>
        </div>

        <div className="form-group">
          <label htmlFor="review-comment">Comments</label>
          <textarea
            id="review-comment"
            name="comment"
            value={formState.comment}
            onChange={handleChange}
            rows="4"
            disabled={isSubmitting}
            placeholder="Share your thoughts about this quiz"
          ></textarea>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditMode ? 'Updating...' : 'Submitting...') 
              : (isEditMode ? 'Update Review' : 'Submit Review')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm; 