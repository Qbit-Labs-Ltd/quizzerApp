import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createReview, getReviewById, updateReview, updateReviewSimple } from '../services/review';
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
    text: ''
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
      if (!isEditMode || !reviewId) return;

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching review with ID:', reviewId);

        // First check if we can find the quiz ID in localStorage
        const quizIdFromStorage = localStorage.getItem(`review_${reviewId}_quizId`);

        // Store quiz ID from URL if not already stored (for future operations)
        if (!quizIdFromStorage && id) {
          console.log(`Quiz ID from URL (${id}) not found in storage, storing it now`);
          localStorage.setItem(`review_${reviewId}_quizId`, id);
        } else if (quizIdFromStorage) {
          console.log(`Found quiz ID ${quizIdFromStorage} for review ${reviewId}`);
          // Make sure it matches the URL param for consistency
          if (quizIdFromStorage !== id) {
            console.warn(`Quiz ID mismatch: ${quizIdFromStorage} in storage vs ${id} in URL`);

            // Update localStorage with the more reliable ID (from URL)
            if (id) {
              console.log(`Updating stored quiz ID from ${quizIdFromStorage} to ${id}`);
              localStorage.setItem(`review_${reviewId}_quizId`, id);
            }
          }
        }

        // Track recent quizzes for potential searching (limited to 10)
        try {
          const recentQuizzes = JSON.parse(localStorage.getItem('recentQuizzes') || '[]');
          if (!recentQuizzes.includes(id)) {
            recentQuizzes.unshift(id); // Add to front
            if (recentQuizzes.length > 10) {
              recentQuizzes.pop(); // Remove oldest if more than 10
            }
            localStorage.setItem('recentQuizzes', JSON.stringify(recentQuizzes));
          }
        } catch (e) {
          console.error('Error updating recent quizzes:', e);
        }

        // Try to get the review data with improved error handling
        let reviewData;
        try {
          reviewData = await getReviewById(reviewId);
        } catch (fetchError) {
          console.error('Error from getReviewById:', fetchError);
          throw new Error(`Error fetching review: ${fetchError.message}`);
        }

        if (!reviewData) {
          throw new Error('Could not load review data - empty response');
        }

        console.log('Loaded review data:', reviewData);

        // Pre-fill form with review data
        setFormState({
          nickname: reviewData.nickname || '',
          rating: reviewData.rating || 0,
          text: reviewData.text || ''
        });
      } catch (err) {
        console.error('Error in review data fetch process:', err);
        setError(
          `Failed to load review data. ${err.message || 'The review may have been deleted or is not accessible.'}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [reviewId, isEditMode, id]);

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
    } if (!formState.rating) {
      setError('Please select a rating');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode && reviewId) {
        console.log('Updating review:', reviewId);
        // Update existing review
        try {
          console.log('Submitting review update with data:', formState);

          // Try the simplified API approach that only sends rating and text fields
          try {
            console.log('Using simplified update (rating + text only)');
            const updatedReview = await updateReviewSimple(reviewId, formState.rating, formState.text);
            console.log('Review updated successfully with simplified API:', updatedReview);

            // Show success message
            alert('Review updated successfully!');
            // Navigate back to reviews page
            navigate(`/quiz/${id}/reviews`);
            return; // Exit early on success
          } catch (simpleError) {
            console.log('Simplified update failed:', simpleError);
            // Fall back to standard approach if simplified fails
          }

          // Standard approach with full review data
          const updatedReview = await updateReview(reviewId, {
            quizId: Number(id),
            nickname: formState.nickname, // We keep this for our frontend validation
            rating: formState.rating,
            text: formState.text // The service will rename this to 'comment' if needed by backend
          });

          console.log('Review updated successfully:', updatedReview);

          // Show success message
          alert('Review updated successfully!');

          // On success, navigate back to reviews page
          navigate(`/quiz/${id}/reviews`);
        } catch (updateError) {
          console.error('Error updating review:', updateError);
          // Extract more detailed error information
          const errorResponse = updateError.response?.data;
          const errorDetails = errorResponse?.message || errorResponse?.error || '';

          // Debug logging to help troubleshoot the backend response
          console.error('Error details:', {
            status: updateError.response?.status,
            statusText: updateError.response?.statusText,
            data: errorResponse,
            message: updateError.message
          });
          // If there's a specific error about unrecognized fields, give a more helpful message
          if (errorDetails.includes("Unrecognized field")) {
            const fieldMatch = errorDetails.match(/Unrecognized field "([^"]+)"/);
            const field = fieldMatch ? fieldMatch[1] : "unknown";
            console.log(`Attempting retry without the problematic field: ${field}`);            // Try using the simplified update function with minimal fields that matches backend expectations
            // Call the simplified function that only sends rating and text
            updateReviewSimple(reviewId, formState.rating, formState.text).then(updatedReview => {
              console.log('Review update successful on retry:', updatedReview);
              alert('Review updated successfully!');
              navigate(`/quiz/${id}/reviews`);
            }).catch(retryError => {
              console.error('Retry also failed:', retryError);
              setError(`Update failed: ${retryError.message || 'Unknown error'}. Please try again later.`);
            });
          } else {
            setError(`Failed to update review: ${errorDetails || updateError.message || 'Unknown error'}. Please try again.`);
          }
          // Stay on the page so the user can try again
        }
      } else {
        console.log('Creating new review');
        try {
          // Create new review
          const newReview = await createReview({
            quizId: Number(id),
            nickname: formState.nickname,
            rating: formState.rating,
            text: formState.text
          });

          console.log('New review created:', newReview);

          // Show thank you popup
          alert('Thank you for submitting your review!');

          // Navigate to reviews page
          navigate(`/quiz/${id}/reviews`);
        } catch (createError) {
          console.error('Error creating review:', createError);
          setError(createError.message || 'Failed to submit review. Please try again.');
          // Stay on the page so the user can try again
        }
      }
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
        </div>

        <div className="form-group">
          <label htmlFor="review-text">Comments</label>
          <textarea
            id="review-text"
            name="text"
            value={formState.text}
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