import axios from 'axios';

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
  try {
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

    // In development/mock mode, handle differently
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      console.log('Creating mock review:', reviewData);
      const mockReview = {
        ...reviewData,
        id: Math.floor(Math.random() * 10000),
        createdAt: new Date().toISOString()
      };

      // Store the relationship for redirect functionality
      storeReviewQuizRelation(mockReview.id, review.quizId);

      return mockReview;
    }

    const response = await axios.post(`${API_URL}/quizzes/${review.quizId}/reviews`, reviewData);

    // Store the relationship for redirect functionality
    storeReviewQuizRelation(response.data.id, review.quizId);

    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Gets a review by ID
 * @param {number} reviewId - The ID of the review to fetch
 * @returns {Promise<Object>} The review
 */
export const getReviewById = async (reviewId) => {
  try {
    // In development/mock mode, return mock data
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      console.log('Getting mock review:', reviewId);
      // Generate a mock review
      const mockReview = {
        id: Number(reviewId),
        quizId: 1, // Placeholder
        nickname: 'Student',
        rating: 4,
        text: 'This is a mock review for testing edit functionality',
        createdAt: new Date().toISOString()
      };

      // Store the relationship for redirect functionality
      storeReviewQuizRelation(mockReview.id, mockReview.quizId);

      return mockReview;
    }

    const response = await axios.get(`${API_URL}/reviews/${reviewId}`);

    // Store the relationship for redirect functionality
    storeReviewQuizRelation(response.data.id, response.data.quizId);

    return response.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

/**
 * Updates an existing review
 * @param {number} reviewId - The ID of the review to update
 * @param {Object} review - The updated review data
 * @returns {Promise<Object>} The updated review
 */
export const updateReview = async (reviewId, review) => {
  try {
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

    // In development/mock mode, handle differently
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      console.log('Updating mock review:', reviewId, reviewData);
      return {
        ...reviewData,
        id: Number(reviewId),
        updatedAt: new Date().toISOString()
      };
    }

    const response = await axios.put(`${API_URL}/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Gets all reviews for a quiz
 * @param {number} quizId - The ID of the quiz
 * @returns {Promise<Array>} Array of reviews
 */
export const getReviewsByQuizId = async (quizId) => {
  try {
    // In development/mock mode, return mock data
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      console.log('Getting mock reviews for quiz:', quizId);
      // Generate some mock reviews
      const mockReviews = [
        {
          id: 1,
          quizId: Number(quizId),
          nickname: 'Student1',
          rating: 4,
          text: 'Great quiz, learned a lot!',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          quizId: Number(quizId),
          nickname: 'Student2',
          rating: 5,
          text: 'Perfect difficulty level, very engaging',
          createdAt: new Date().toISOString()
        }
      ];

      // Store relationships for each review
      mockReviews.forEach(review => {
        storeReviewQuizRelation(review.id, review.quizId);
      });

      return mockReviews;
    }

    const response = await axios.get(`${API_URL}/quizzes/${quizId}/reviews`);

    // Store relationships for each review
    if (Array.isArray(response.data)) {
      response.data.forEach(review => {
        storeReviewQuizRelation(review.id, quizId);
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}; 