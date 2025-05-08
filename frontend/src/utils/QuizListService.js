import axios from 'axios';
import { mockQuizzes } from '../../mockData';

// Toggle between mock data (development) and real API (production)
const isDev = false;

/**
 * Service for fetching published quizzes
 * Provides methods for retrieving published quiz data
 */
class QuizListService {
  /**
   * Base API URL for quiz-related endpoints
   */
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080/api',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Retrieves all published quizzes
   * @returns {Promise<Array>} Array of published quiz objects
   */
  async getPublishedQuizzes() {
    try {
      const response = await this.api.get('/quizzes/published');
      return response.data;
    } catch (error) {
      console.error('Error fetching published quizzes:', error);
      throw error;
    }
  }

  /**
   * Retrieves a specific published quiz by ID
   * @param {number|string} id - Quiz ID
   * @returns {Promise<Object>} Quiz object if published, or null
   */
  async getPublishedQuizById(id) {
    try {
      const response = await this.api.get(`/quizzes/${id}`);
      const quiz = response.data;

      // Only return the quiz if it's published
      if (!quiz.published) {
        throw new Error('Quiz is not published');
      }

      return quiz;
    } catch (error) {
      console.error('Error fetching published quiz:', error);
      throw error;
    }
  }
}

export default new QuizListService(); 