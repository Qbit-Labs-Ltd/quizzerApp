import axios from 'axios';
import { questionApi } from '../utils/api';

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
   * Retrieves the user's personal score for a specific quiz using actual answers
   * @param {number|string} quizId - Quiz ID
   * @returns {Promise<Object>} Score object with correct and wrong counts
   */
  async getMyScore(quizId) {
    try {
      // Get user answers from session storage
      const userAnswersKey = `quiz_${quizId}_answers`;
      const userAnswersJson = sessionStorage.getItem(userAnswersKey);

      if (!userAnswersJson) {
        throw new Error('No saved answers found for this quiz');
      }

      const userAnswers = JSON.parse(userAnswersJson);

      // Get all questions for this quiz
      const questions = await questionApi.getByQuizId(quizId);

      if (!questions || questions.length === 0) {
        throw new Error('Failed to load quiz questions');
      }

      // Calculate score by comparing user answers to correct answers
      let correctCount = 0;
      let wrongCount = 0;

      questions.forEach(question => {
        // Find the correct answer for this question
        const correctAnswerId = question.answers.find(a => a.correct)?.id;

        // Find user's answer for this question
        const userAnswer = userAnswers.find(a => a.questionId === question.id);

        if (userAnswer && userAnswer.selectedAnswerId === correctAnswerId) {
          correctCount++;
        } else {
          wrongCount++;
        }
      });

      const totalQuestions = questions.length;
      const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      return {
        quizId: Number(quizId),
        correctCount,
        wrongCount,
        totalQuestions,
        percentage,
        // Add user answer data for reference
        userAnswers
      };
    } catch (error) {
      console.error('Error calculating quiz score:', error);
      throw error;
    }
  }
}

export default new QuizScoreService(); 