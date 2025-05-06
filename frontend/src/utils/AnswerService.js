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
      baseURL: 'https://quizzer-app-git-quizzerapp.2.rahtiapp.fi/api',  // Or the correct API URL
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
    if (isDev) {
      console.log(`Using mock questions for quiz id: ${quizId}`);
      // Check if the quiz is published first
      const quiz = mockQuizzes.find(q => q.id === Number(quizId));
      if (!quiz || !quiz.published) {
        throw new Error('Quiz not found or not published');
      }
      return mockQuestions.filter(q => q.quizId === Number(quizId));
    }

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
    if (isDev) {
      console.log(`Submitting mock answers for quiz id: ${quizId}`, answers);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate mock results
      let correctCount = 0;
      const questionResults = [];
      
      // For each answer, check if it's correct
      for (const answer of answers) {
        const question = mockQuestions.find(q => q.id === answer.questionId);
        if (!question) continue;
        
        const correctAnswerId = question.answers.find(a => a.correct)?.id;
        const isCorrect = answer.selectedAnswerId === correctAnswerId;
        
        if (isCorrect) correctCount++;
        
        questionResults.push({
          questionId: answer.questionId,
          isCorrect,
          correctAnswerId,
          explanation: isCorrect ? 'Correct answer!' : 'The selected answer is incorrect.'
        });
      }
      
      const score = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
      
      return {
        quizId: Number(quizId),
        score,
        totalQuestions: answers.length,
        correctAnswers: correctCount,
        questionResults
      };
    }

    try {
      const response = await this.api.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      console.error('Error submitting answers:', error);
      throw error;
    }
  }

  /**
   * Get a quiz result by ID
   * @param {number|string} resultId - The ID of the result to retrieve
   * @returns {Promise<Object>} Quiz result object
   */
  async getResultById(resultId) {
    if (isDev) {
      console.log(`This would fetch the result with id: ${resultId}`);
      throw new Error('Mock data does not support fetching results by ID');
    }

    try {
      const response = await this.api.get(`/results/${resultId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching result:', error);
      throw error;
    }
  }
}

export default new AnswerService(); 