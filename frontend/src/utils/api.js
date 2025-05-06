import axios from 'axios';
import { mockQuestions, mockQuizzes } from '../../mockData';

// Toggle between mock data (development) and real API (production)
const isDev = import.meta.env.DEV; // Use Vite's built-in environment detection
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Base axios instance for API requests
 * Configured with common settings for all API calls
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * Generates a random ID for mock data objects
 * @returns {number} A random integer ID
 */
const generateId = () => Math.floor(Math.random() * 10000);

// Insert new mock categories for dev mode
let mockCategories = [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Science' }
];

/**
 * API utilities for quiz-related operations
 * Provides methods for CRUD operations on quizzes
 */
export const quizApi = {
    /**
     * Retrieves all quizzes
     * @returns {Promise<Array>} Array of quiz objects
     */
    getAll: async () => {
        if (isDev && useMockData) {
            console.log('Using mock quiz data');
            return mockQuizzes;
        }
        const response = await api.get('/quizzes');
        return response.data;
    },

    /**
     * Retrieves a specific quiz by ID
     * @param {number|string} id - Quiz ID
     * @returns {Promise<Object>} Quiz object
     */
    getById: async (id) => {
        if (isDev && useMockData) {
            console.log(`Using mock data for quiz id: ${id}`);
            const quiz = mockQuizzes.find(q => q.id === Number(id));
            if (!quiz) throw new Error('Quiz not found');
            return quiz;
        }
        const response = await api.get(`/quizzes/${id}`);
        return response.data;
    },

    /**
     * Creates a new quiz
     * @param {Object} quizData - Quiz data to create
     * @returns {Promise<Object>} Created quiz object
     */
    create: async (quizData) => {
        if (isDev && useMockData) {
            console.log('Creating mock quiz', quizData);
            const newQuiz = {
                id: generateId(),
                ...quizData,
                dateAdded: new Date().toISOString(),
                questionCount: 0
            };
            // Add to mockQuizzes array to persist the data
            mockQuizzes.push(newQuiz);
            return newQuiz;
        }
        const response = await api.post('/quizzes', quizData);
        return response.data;
    },

    /**
     * Updates an existing quiz
     * @param {number|string} id - Quiz ID
     * @param {Object} quizData - Updated quiz data
     * @returns {Promise<Object>} Updated quiz object
     */
    update: async (id, quizData) => {
        if (isDev && useMockData) {
            console.log(`Updating mock quiz id: ${id}`, quizData);
            // Find and update the quiz in mockQuizzes
            const quizIndex = mockQuizzes.findIndex(q => q.id === Number(id));
            if (quizIndex !== -1) {
                mockQuizzes[quizIndex] = {
                    ...mockQuizzes[quizIndex],
                    ...quizData
                };
                return mockQuizzes[quizIndex];
            }
            throw new Error('Quiz not found');
        }
        const response = await api.put(`/quizzes/${id}`, quizData);
        return response.data;
    },

    /**
     * Deletes a quiz and its associated questions
     * @param {number|string} id - Quiz ID
     * @returns {Promise<boolean>} Success status
     */
    delete: async (id) => {
        if (isDev && useMockData) {
            console.log(`Deleting mock quiz id: ${id}`);
            const quizIndex = mockQuizzes.findIndex(q => q.id === Number(id));
            if (quizIndex !== -1) {
                mockQuizzes.splice(quizIndex, 1);
            }
            // Also delete associated questions
            const questionsToRemove = mockQuestions.filter(q => q.quizId === Number(id));
            questionsToRemove.forEach(question => {
                const qIndex = mockQuestions.findIndex(q => q.id === question.id);
                if (qIndex !== -1) {
                    mockQuestions.splice(qIndex, 1);
                }
            });
            return true;
        }
        await api.delete(`/quizzes/${id}`);
        return true;
    },

    /**
     * Retrieves aggregated results for a quiz (correct vs wrong counts for each question)
     * @param {number|string} id - Quiz ID
     * @returns {Promise<Array>} Array of result objects
     */
    getResults: async (id) => {
        if (isDev && useMockData) {
            // Generate mock stats from mockQuestions
            const results = mockQuestions
                .filter(q => q.quizId === Number(id))
                .map(q => {
                    // For demo: random correct/wrong counts between 0-20
                    const correct = Math.floor(Math.random() * 21);
                    const wrong = Math.floor(Math.random() * 21);
                    return {
                        questionId: q.id,
                        content: q.content,
                        correctCount: correct,
                        wrongCount: wrong
                    };
                });
            return results;
        }
        const response = await api.get(`/quizzes/${id}/results`);
        return response.data;
    }
};

/**
 * API utilities for question-related operations
 * Provides methods for CRUD operations on questions
 */
export const questionApi = {
    /**
     * Retrieves all questions for a specific quiz
     * @param {number|string} quizId - Quiz ID
     * @returns {Promise<Array>} Array of question objects
     */
    getByQuizId: async (quizId) => {
        if (isDev && useMockData) {
            console.log(`Getting mock questions for quiz id: ${quizId}`);
            return mockQuestions.filter(q => q.quizId === Number(quizId));
        }
        const response = await api.get(`/quizzes/${quizId}/questions`);
        return response.data;
    },

    /**
     * Creates a new question for a quiz
     * @param {number|string} quizId - Quiz ID
     * @param {Object} questionData - Question data to create
     * @returns {Promise<Object>} Created question object
     */
    create: async (quizId, questionData) => {
        if (isDev && useMockData) {
            console.log(`Creating mock question for quiz: ${quizId}`, questionData);
            const newQuestion = {
                id: generateId(),
                quizId: Number(quizId),
                content: questionData.content,
                difficulty: questionData.difficulty,
                answers: questionData.answers ? questionData.answers.map(answer => ({
                    id: generateId(),
                    text: answer.text,
                    correct: answer.correct
                })) : []
            };
            mockQuestions.push(newQuestion);

            // Update the quiz's questionCount
            const quizIndex = mockQuizzes.findIndex(q => q.id === Number(quizId));
            if (quizIndex !== -1) {
                mockQuizzes[quizIndex].questionCount = (mockQuizzes[quizIndex].questionCount || 0) + 1;
            }

            return newQuestion;
        }
        const response = await api.post(`/quizzes/${quizId}/questions`, questionData);
        return response.data;
    },

    /**
     * Updates an existing question
     * @param {number|string} id - Question ID
     * @param {Object} questionData - Updated question data
     * @returns {Promise<Object>} Updated question object
     */
    update: async (id, questionData) => {
        if (isDev && useMockData) {
            console.log(`Updating mock question with id: ${id}`, questionData);
            const index = mockQuestions.findIndex(q => q.id === Number(id));
            if (index !== -1) {
                mockQuestions[index] = {
                    ...mockQuestions[index],
                    ...questionData
                };
                return mockQuestions[index];
            }
            throw new Error('Question not found');
        }
        const response = await api.put(`/questions/${id}`, questionData);
        return response.data;
    },

    /**
     * Deletes a question
     * @param {number|string} id - Question ID
     * @returns {Promise<Object>} Success response
     */
    delete: async (id) => {
        if (isDev && useMockData) {
            console.log(`Deleting mock question with id: ${id}`);
            const questionIndex = mockQuestions.findIndex(q => q.id === Number(id));
            if (questionIndex !== -1) {
                const questionToDelete = mockQuestions[questionIndex];
                mockQuestions.splice(questionIndex, 1);

                // Update the quiz's question count
                const quizIndex = mockQuizzes.findIndex(q => q.id === questionToDelete.quizId);
                if (quizIndex !== -1 && mockQuizzes[quizIndex].questionCount > 0) {
                    mockQuizzes[quizIndex].questionCount -= 1;
                }
            }
            return { success: true };
        }
        const response = await api.delete(`/questions/${id}`);
        return response.data;
    },

    /**
     * Retrieves a specific question by ID
     * @param {number|string} id - Question ID
     * @returns {Promise<Object>} Question object
     */
    getById: async (id) => {
        if (isDev && useMockData) {
            console.log(`Getting mock question with id: ${id}`);
            const question = mockQuestions.find(q => q.id === Number(id));
            if (!question) throw new Error('Question not found');
            return question;
        }
        const response = await api.get(`/questions/${id}`);
        return response.data;
    }
};

/**
 * API utilities for answer-related operations
 * Currently only provides delete functionality
 */
export const answerApi = {
    /**
     * Deletes an answer
     * @param {number|string} id - Answer ID
     * @returns {Promise<boolean>} Success status
     */
    delete: async (id) => {
        if (isDev && useMockData) {
            console.log(`Deleting mock answer id: ${id}`);
            return true;
        }
        await api.delete(`/answers/${id}`);
        return true;
    }
};

/**
 * API utilities for category-related operations
 */
export const categoryApi = {
    /**
     * Fetches all categories
     * @returns {Promise<Array>} Array of category objects
     */
    getAll: async () => {
        if (isDev && useMockData) {
            // Return mock data if in development mode
            return mockCategories;
        }
        const response = await api.get('/categories');
        return response.data;
    },

    /**
     * Fetches a specific category by ID
     * @param {number|string} id - Category ID
     * @returns {Promise<Object>} Category object
     */
    getById: async (id) => {
        if (isDev && useMockData) {
            return mockCategories.find(c => c.id == id);
        }
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    /**
     * Fetches quizzes for a category, optionally only published
     * @param {number|string} categoryId - Category ID
     * @param {boolean} publishedOnly - Whether to only fetch published quizzes
     * @returns {Promise<Array>} Array of quiz objects
     */
    getQuizzes: async (categoryId, publishedOnly = true) => {
        if (isDev && useMockData) {
            // For mock, return all quizzes (or only published)
            let list = [...mockQuizzes];
            if (publishedOnly) list = list.filter(q => q.published);
            return list;
        }
        const url = `/categories/${categoryId}/quizzes${publishedOnly ? '?published=true' : ''}`;
        const response = await api.get(url);
        return response.data;
    }
};

export default api;