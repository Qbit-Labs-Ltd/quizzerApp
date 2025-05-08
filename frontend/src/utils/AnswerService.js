import axios from 'axios';
import { mockQuestions, mockQuizzes } from '../../mockData';

// Toggle between mock data (development) and real API (production)
const isDev = false;

/**
 * Service for submitting quiz answers and receiving results
 * Provides methods for quiz-taking functionality
 */
class AnswerService {
  /**
   * Base API URL for answer-related endpoints
   */
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080/api',  // Local backend URL
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Get all questions for a published quiz
   * @param {number|string} quizId - The ID of the quiz
   * @returns {Promise<Array>} Array of question objects
   */
  async getQuestionsForQuiz(quizId) {
    try {
      const response = await this.api.get(`/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw error;
    }
  }

  /**
   * Submit answers for a quiz and get results
   * @param {number|string} quizId - The ID of the quiz
   * @param {Array} answers - Array of answer objects {questionId, selectedAnswerId}
   * @returns {Promise<Object>} Results object with score and feedback
   */
  async submitAnswers(quizId, answers) {
    try {
      // Log the request data
      console.log('Submitting answers for quiz:', quizId);
      console.log('Answers data:', answers);

      const requestData = { answers };
      console.log('Request payload:', requestData);

      const response = await this.api.post(`/quizzes/${quizId}/submit`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error submitting answers:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }
}

export default AnswerService;