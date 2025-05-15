import axios from 'axios';
import { mockQuestions } from '../../mockData';

// Toggle between mock data (development) and real API (production)
const isDev = true; // Set to true to use mock data

/**
 * Service for fetching quiz score/results data
 * Provides methods for retrieving personal quiz score data
 */
class QuizScoreService {
  /**
   * Constructor initializes the API client
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
   * Retrieves the user's personal score for a specific quiz
   * @param {number|string} quizId - Quiz ID
   * @param {string} sessionId - Session ID (optional for now, will be mocked)
   * @returns {Promise<Object>} Score object with correct and wrong counts
   */
  async getMyScore(quizId, sessionId = 'mock-session') {
    try {
      // If isDev is false, call the real API
      if (!isDev) {
        const response = await this.api.get(`/quizzes/${quizId}/my-score?session=${sessionId}`);
        return response.data;
      }
      
      // Otherwise, use mock data
      console.log('Using mock data for quiz score:', quizId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the actual questions for this quiz from mockData
      const quizQuestions = mockQuestions.filter(q => q.quizId === Number(quizId));
      const totalQuestions = quizQuestions.length;
      
      // For quiz ID 1 (JavaScript Fundamentals) 
      if (Number(quizId) === 1) {
        // Special handling for quiz 1 which has inconsistencies in the data
        // Hard-coding to match actual experience
        if (sessionId === 'perfect-score') {
          // Perfect score mock
          return {
            quizId: Number(quizId),
            sessionId: sessionId,
            correctCount: 2, // User got all 2 questions right
            wrongCount: 0,
            totalQuestions: 2, // Only 2 questions are shown to user
            percentage: 100
          };
        } else {
          // Default response for quiz 1
          return {
            quizId: Number(quizId),
            sessionId: sessionId,
            correctCount: 2, // User got 2 questions right
            wrongCount: 0,   // 0 wrong
            totalQuestions: 2, // Only 2 questions shown to user
            percentage: 100  // 100% correct
          };
        }
      }
      
      // For quiz ID 5 (Python Basics)
      else if (Number(quizId) === 5) {
        // This quiz actually has 2 questions
        return {
          quizId: Number(quizId),
          sessionId: sessionId,
          correctCount: 2, // User got both right
          wrongCount: 0,
          totalQuestions: 2,
          percentage: 100
        };
      }
      
      // Default response for any other quiz
      // Create a perfect score result based on actual question count
      return {
        quizId: Number(quizId),
        sessionId: sessionId,
        correctCount: totalQuestions, // User got all questions right
        wrongCount: 0,
        totalQuestions: totalQuestions || 2, // Fallback to 2 if no questions found
        percentage: 100
      };
    } catch (error) {
      console.error('Error fetching quiz score:', error);
      throw error;
    }
  }
}

export default new QuizScoreService(); 