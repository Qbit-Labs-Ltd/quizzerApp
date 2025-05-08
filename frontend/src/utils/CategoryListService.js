import axios from 'axios';

/**
 * Mock data for categories
 */
const mockCategories = [
  { id: 1, name: 'Programming', description: 'Programming and coding related quizzes' },
  { id: 2, name: 'Mathematics', description: 'Math concepts and problem solving' },
  { id: 3, name: 'Science', description: 'Scientific theories and experiments' },
  { id: 4, name: 'Languages', description: 'Language learning and linguistics' },
  { id: 5, name: 'History', description: 'Historical events and figures' }
];

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
      console.log("Categories fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Don't fall back to mock data - throw the error so the UI can handle it properly
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

  /**
   * Updates an existing category
   * @param {number|string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} Updated category object
   */
  async updateCategory(id, categoryData) {
    try {
      console.log(`Updating category ${id} with data:`, categoryData);
      const response = await this.api.put(`/categories/${id}`, categoryData);
      console.log("Category updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Deletes a category
   * @param {number|string} id - Category ID
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    try {
      console.log(`Deleting category ${id}`);
      await this.api.delete(`/categories/${id}`);
      console.log("Category deleted successfully");
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

export default new CategoryListService();