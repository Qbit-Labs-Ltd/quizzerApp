import axios from 'axios';
import { safeApiCall } from '../utils/api';

// Use the same base URL as other API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Stores a relationship between a review ID and quiz ID for later reference
 * This is used for the edit review functionality to redirect properly
 * @param {number} reviewId - ID of the review
 * @param {number} quizId - ID of the quiz the review belongs to
 */
const storeReviewQuizRelation = (reviewId, quizId) => {
  if (reviewId && quizId) {
    localStorage.setItem(`review_${reviewId}_quizId`, quizId.toString());
  }
};

/**
 * Creates a new review for a quiz
 * @param {Object} review - The review data to submit 
 * @param {number} review.quizId - The ID of the quiz
 * @param {string} review.nickname - The reviewer's nickname
 * @param {number} review.rating - The rating (1-5)
 * @param {string} review.text - The review text
 * @returns {Promise<Object>} The created review
 */
export const createReview = async (review) => {
  // Validate required fields
  if (!review.quizId || !review.nickname || !review.rating) {
    throw new Error('Missing required review fields');
  }

  // Ensure rating is a number between 1 and 5
  const rating = Number(review.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }

  // Format the review data to match backend expectations
  const reviewData = {
    nickname: review.nickname.trim(),
    rating: rating,
    text: review.text ? review.text.trim() : ''
  };

  return safeApiCall(async () => {
    const response = await axios.post(`${API_URL}/quizzes/${review.quizId}/reviews`, reviewData);

    // Store the relationship for redirect functionality
    storeReviewQuizRelation(response.data.id, review.quizId);

    return response.data;
  }, {
    throwError: true,
    onError: (error) => {
      console.error('API error creating review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create review. Please try again.';
      throw new Error(errorMessage);
    }
  });
};

/**
 * Gets a review by ID
 * @param {number} reviewId - The ID of the review to fetch
 * @returns {Promise<Object>} The review
 */
export const getReviewById = async (reviewId) => {
  // Ensure reviewId is a number
  const numReviewId = Number(reviewId);

  if (isNaN(numReviewId)) {
    throw new Error('Invalid review ID');
  }

  console.log(`Attempting to fetch review with ID: ${numReviewId}`);

  // First try to retrieve the quiz ID from localStorage (which we stored during list rendering)
  const storedQuizId = localStorage.getItem(`review_${numReviewId}_quizId`);

  if (storedQuizId) {
    console.log(`Found stored quizId ${storedQuizId} for review ${numReviewId}`);

    try {
      // Approach 1: Try direct GET on the review ID endpoint first if available
      try {
        console.log(`Trying direct fetch from /reviews/${numReviewId}`);
        const directResponse = await axios.get(`${API_URL}/reviews/${numReviewId}`);
        if (directResponse && directResponse.data) {
          console.log(`Successfully got review directly from endpoint`);
          const review = directResponse.data;
          // Make sure to maintain the relationship with quiz
          storeReviewQuizRelation(review.id, storedQuizId);
          return review;
        }
      } catch (directError) {
        console.log(`Direct review endpoint not available or failed: ${directError.message}`);
        // Continue to fallback approach if direct endpoint doesn't work
      }

      // Approach 2: Fallback to fetching all reviews for the quiz and filtering
      console.log(`Fetching all reviews for quiz ${storedQuizId}`);
      const response = await axios.get(`${API_URL}/quizzes/${storedQuizId}/reviews`);

      // Handle different response formats
      let reviews = [];
      if (Array.isArray(response.data)) {
        reviews = response.data;
      } else if (response.data && Array.isArray(response.data.reviews)) {
        reviews = response.data.reviews;
      }

      // Find the review with the matching ID
      const review = reviews.find(r => r.id === numReviewId || r.id === String(numReviewId));

      if (review) {
        console.log(`Found review with ID ${numReviewId} in the quiz reviews`);
        // Make sure to maintain the relationship with quiz
        storeReviewQuizRelation(review.id, storedQuizId);
        return review;
      }

      console.warn(`Review with ID ${numReviewId} not found in quiz ${storedQuizId} reviews`);
      throw new Error(`Review with ID ${numReviewId} not found in quiz ${storedQuizId}`);

    } catch (error) {
      console.error('Error fetching review:', error);
      throw new Error(`Failed to fetch review data: ${error.message || 'Unknown error'}`);
    }
  } else {
    console.warn(`No stored quizId found for review ${numReviewId}`);

    // Try to search through recent quizzes to find the review
    try {
      // Get list of recent quizzes from localStorage (if available)
      const recentQuizzes = JSON.parse(localStorage.getItem('recentQuizzes') || '[]');

      if (recentQuizzes.length > 0) {
        console.log(`Attempting to search for review in ${recentQuizzes.length} recent quizzes`);

        // Try each quiz one by one
        for (const quizId of recentQuizzes) {
          try {
            const response = await axios.get(`${API_URL}/quizzes/${quizId}/reviews`);

            // Process the response
            let reviews = [];
            if (Array.isArray(response.data)) {
              reviews = response.data;
            } else if (response.data && Array.isArray(response.data.reviews)) {
              reviews = response.data.reviews;
            }

            // Look for the review in this quiz's reviews
            const review = reviews.find(r => r.id === numReviewId || r.id === String(numReviewId));
            if (review) {
              console.log(`Found review ${numReviewId} in quiz ${quizId}`);
              storeReviewQuizRelation(review.id, quizId);
              return review;
            }
          } catch (quizError) {
            console.log(`Failed to check quiz ${quizId}: ${quizError.message}`);
            continue; // Try the next quiz
          }
        }
      }
    } catch (searchError) {
      console.error('Error searching for review in recent quizzes:', searchError);
    }
  }

  // If we couldn't find the review, throw an error
  throw new Error('Failed to fetch review data. The review may have been deleted or the quiz is unavailable.');
};

/**
 * Updates an existing review
 * @param {number} reviewId - The ID of the review to update
 * @param {Object} review - The updated review data
 * @returns {Promise<Object>} The updated review
 */
export const updateReview = async (reviewId, review) => {
  // Validate required fields
  if (!review.quizId || !review.nickname || !review.rating) {
    throw new Error('Missing required review fields');
  }

  // Ensure rating is a number between 1 and 5
  const rating = Number(review.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }

  // Ensure reviewId is a number
  const numReviewId = Number(reviewId);

  if (isNaN(numReviewId)) {
    throw new Error('Invalid review ID');
  }  // Format the review data to match backend expectations
  // The error message indicates the backend's ReviewUpdateRequest class doesn't accept 'nickname'
  // Let's structure the data based on what the backend likely expects

  // From the SQL schema we know fields are: nickname, rating, text, quiz_id
  // But the update request might be different than the entity structure
  const reviewData = {
    // Include only rating and text since those are the fields users typically update
    rating: rating,
    text: review.text ? review.text.trim() : ''
    // Explicitly NOT including nickname since that's causing the error
  };

  // Log the data being sent
  console.log('Sending review update data:', reviewData);

  // Store the relationship before making the API call
  storeReviewQuizRelation(numReviewId, review.quizId);

  return safeApiCall(async () => {
    const response = await axios.put(`${API_URL}/reviews/${numReviewId}`, reviewData);
    return response.data;
  }, {
    throwError: true,
    onError: (error) => {
      console.error('API error updating review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update review. Please try again.';
      throw new Error(errorMessage);
    }
  });
};

/**
 * Updates an existing review with minimal data to match backend expectations
 * Use this for compatibility with ReviewUpdateRequest class
 * @param {number} reviewId - The ID of the review to update 
 * @param {number} rating - The rating value (1-5)
 * @param {string} text - The review text/comment
 * @returns {Promise<Object>} The updated review
 */
export const updateReviewSimple = async (reviewId, rating, text) => {
  // Ensure parameters are valid
  const numReviewId = Number(reviewId);
  const numRating = Number(rating);

  if (isNaN(numReviewId)) {
    throw new Error('Invalid review ID');
  }

  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }

  // Format the data to match exactly what backend expects
  const reviewData = {
    rating: numRating,
    text: text ? text.trim() : ''
  };

  console.log('Sending simplified review update data:', reviewData);

  return safeApiCall(async () => {
    const response = await axios.put(`${API_URL}/reviews/${numReviewId}`, reviewData);
    return response.data;
  }, {
    throwError: true,
    onError: (error) => {
      console.error('API error updating review (simple):', error);
      const errorMessage = error.response?.data?.message || 'Failed to update review. Please try again.';
      throw new Error(errorMessage);
    }
  });
};

/**
 * Gets all reviews for a quiz
 * @param {number} quizId - The ID of the quiz
 * @returns {Promise<Array|Object>} Array of reviews or object with reviews array and metadata
 */
export const getReviewsByQuizId = async (quizId) => {
  return safeApiCall(
    async () => {
      const response = await axios.get(`${API_URL}/quizzes/${quizId}/reviews`);      // Store relationships for each review to help with navigation
      if (Array.isArray(response.data)) {
        response.data.forEach(review => {
          storeReviewQuizRelation(review.id, quizId);
        });

        // Also track this quiz in recent quizzes for improved review lookup
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

        return response.data;
      } else if (response.data && response.data.reviews && Array.isArray(response.data.reviews)) {
        // If the response has a reviews property with an array, store relationships and return it
        response.data.reviews.forEach(review => {
          storeReviewQuizRelation(review.id, quizId);
        });

        // Also track this quiz in recent quizzes for improved review lookup
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

        return response.data;
      } else {
        // Return empty array if no reviews or unexpected format
        console.warn('Unexpected response format for reviews:', response.data);
        return { reviews: [], total: 0, avgRating: 0 };
      }
    },
    {
      throwError: false,
      onError: (error) => {
        console.error('Error fetching reviews for quiz', quizId, ':', error);
      }
    }
  ) || { reviews: [], total: 0, avgRating: 0 }; // Default value if API call returns null
};