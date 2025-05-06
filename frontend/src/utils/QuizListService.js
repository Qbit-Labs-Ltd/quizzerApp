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
      baseURL: 'https://quizzer-app-git-quizzerapp.2.rahtiapp.fi/api',  // Or the correct API URL
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
    if (isDev) {
      console.log('Using mock quiz data for published quizzes');
      return mockQuizzes.filter(quiz => quiz.published === true);
    }

    try {
      const response = await this.api.get('/quizzes/published');
      return response.data;
    } catch (error) {
      // If the specific endpoint doesn't exist, fallback to filtering all quizzes
      const response = await this.api.get('/quizzes');
      return response.data.filter(quiz => quiz.published === true);
    }
  }

  /**
   * Retrieves a specific published quiz by ID
   * @param {number|string} id - Quiz ID
   * @returns {Promise<Object>} Quiz object if published, or null
   */
  async getPublishedQuizById(id) {
    if (isDev) {
      console.log(`Using mock data for published quiz id: ${id}`);
      const quiz = mockQuizzes.find(q => q.id === Number(id) && q.published === true);
      if (!quiz) throw new Error('Published quiz not found');
      return quiz;
    }

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