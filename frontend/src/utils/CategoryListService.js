import axios from 'axios';

/**
 * Service for fetching categories
 * Provides methods for retrieving category data
 */
class CategoryListService {
  /**
   * Base API URL for category-related endpoints
   */
  constructor() {
    this.api = axios.create({
      baseURL: `${import.meta.env.VITE_BACKEND_URL || ''}/api`,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Retrieves all categories
   * @returns {Promise<Array>} Array of category objects
   */
  async getAllCategories() {
    try {
      const response = await this.api.get('/categories');
      return response.data;
    } catch (error) {
      // If the categories endpoint doesn't exist or fails, return an empty array
      console.error('Error fetching categories:', error);
      
      // For development purposes, return some fallback categories if the endpoint doesn't exist
      return [
        { id: 1, name: 'Programming', description: 'Programming and coding related quizzes' },
        { id: 2, name: 'Mathematics', description: 'Math concepts and problem solving' },
        { id: 3, name: 'Science', description: 'Scientific theories and experiments' },
        { id: 4, name: 'Languages', description: 'Language learning and linguistics' },
        { id: 5, name: 'History', description: 'Historical events and figures' }
      ];
    }
  }

  /**
   * Retrieves quizzes by category ID
   * @param {number|string} categoryId - The ID of the category
   * @returns {Promise<Array>} Array of quiz objects in the category
   */
  async getQuizzesByCategory(categoryId) {
    try {
      const response = await this.api.get(`/categories/${categoryId}/quizzes`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quizzes for category ${categoryId}:`, error);
      // Return empty array if endpoint doesn't exist or fails
      return [];
    }
  }
}

export default new CategoryListService(); 