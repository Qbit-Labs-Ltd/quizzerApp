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
    // Use VITE_API_URL for consistent API access across components
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log("CategoryListService initialized with baseURL:", this.api.defaults.baseURL);
  }

  /**
   * Retrieves all categories
   * @returns {Promise<Array>} Array of category objects
   */
  async getAllCategories() {
    try {
      console.log("Fetching categories from:", this.api.defaults.baseURL + '/categories');
      const response = await this.api.get('/categories');
      console.log("Categories fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Propagate the error instead of silently returning mock data
      throw error;
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
      throw error;
    }
  }

  /**
   * Creates a new category
   * @param {Object} categoryData - The data for the new category
   * @returns {Promise<Object>} The created category object
   */
  async createCategory(categoryData) {
    try {
      console.log("Creating category with data:", categoryData);
      const response = await this.api.post('/categories', categoryData);
      console.log("Category created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
}

export default new CategoryListService();