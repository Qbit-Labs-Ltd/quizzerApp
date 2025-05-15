import axios from 'axios';
import { mockQuestions as importedMockQuestions, mockQuizzes as importedMockQuizzes } from '../../mockData';

// Create local mutable copies of the imported mock data
let mockQuizzes = [...importedMockQuizzes];
let mockQuestions = [...importedMockQuestions];

// Toggle between mock data (development) and real API (production)
const isDev = import.meta.env.DEV; // Use Vite's built-in environment detection
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Base axios instance for API requests
 * Configured with common settings for all API calls
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    response => response,
    error => {
        // Handle server errors
        if (error.response && error.response.status === 500) {
            console.error('Server error details:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers,
                config: {
                    url: error.response.config.url,
                    method: error.response.config.method,
                    data: error.response.config.data
                }
            });
        }
        
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

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
        // If running in mock mode, handle differently
        if (isDev && useMockData) {
            // Mock implementation remains unchanged
            console.log('Updating mock quiz', id, quizData);
            const index = mockQuizzes.findIndex(q => q.id === Number(id));
            if (index !== -1) {
                mockQuizzes[index] = {
                    ...mockQuizzes[index],
                    ...quizData,
                    // Ensure published flag is boolean
                    published: Boolean(quizData.published)
                };
                return { ...mockQuizzes[index] };
            }
            throw new Error('Quiz not found');
        }

        try {
            // Make a copy of the quiz data to avoid mutating the original
            const formattedData = { ...quizData };

            // Ensure published is a boolean
            if ('published' in formattedData) {
                formattedData.published = Boolean(formattedData.published);
            }

            // Fix the category issue - format it as an object with an id property
            if (formattedData.category) {
                // If it's already an object with an id property, leave it as is
                if (typeof formattedData.category === 'object' && formattedData.category.id) {
                    // Already in correct format
                }
                // If it's a string or number, convert to an object with id
                else {
                    formattedData.category = {
                        id: Number(formattedData.category)
                    };
                }
            } else {
                // If category is empty string or falsy value, remove it completely
                delete formattedData.category;
            }

            console.log(`Updating quiz ${id} with formatted data:`, formattedData);

            // First try PUT request (RESTful approach)
            try {
                const response = await api.put(`/quizzes/${id}`, formattedData);
                return response.data;
            } catch (putError) {
                // Existing error handling
            }
        } catch (error) {
            // Existing error handling
        }
    },

    /**
     * Deletes a quiz and its associated questions
     * @param {number|string} id - Quiz ID
     * @returns {Promise<boolean>} Success status
     */
    delete: async (id) => {
        if (isDev && useMockData) {
            // Mock implementation (keep this as is)
            console.log(`Deleting mock quiz with id: ${id}`);
            const index = mockQuizzes.findIndex(q => q.id === Number(id));
            if (index !== -1) {
                // Remove all related questions
                mockQuestions = mockQuestions.filter(q => q.quizId !== Number(id));
                // Remove the quiz
                mockQuizzes.splice(index, 1);
            }
            return true;
        }
        try {
            // Fetch questions for this quiz
            let questions = [];
            try {
                const questionsResponse = await api.get(`/quizzes/${id}/questions`);
                questions = questionsResponse.data || [];
            } catch (error) {
                console.warn('Could not fetch questions before quiz deletion:', error);
                // Continue with deletion attempt even if we couldn't get questions
            }

            // If there are questions, ask for confirmation
            if (questions.length > 0) {
                const confirm = window.confirm(
                    `This quiz has ${questions.length} questions. All these questions will be deleted. Continue?`
                );

                if (!confirm) {
                    throw new Error('Delete cancelled by user');
                }

                // Delete all questions first - important to prevent foreign key constraint errors
                console.log(`Deleting ${questions.length} questions before deleting quiz`);
                for (const question of questions) {
                    try {
                        await api.delete(`/questions/${question.id}`);
                    } catch (questionDeleteError) {
                        console.error(`Failed to delete question ${question.id}:`, questionDeleteError);
                        // Continue trying to delete other questions
                    }
                }
            }

            // Now try to delete the quiz
            await api.delete(`/quizzes/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting quiz:', error);

            // More specific error message based on what might have happened
            if (error.response) {
                if (error.response.status === 500) {
                    throw new Error('Server error when deleting quiz. The quiz may have constraints or dependencies that need to be resolved first.');
                } else if (error.response.status === 404) {
                    throw new Error('Quiz not found. It may have already been deleted.');
                } else if (error.response.status === 403) {
                    throw new Error('You do not have permission to delete this quiz.');
                }
            }

            throw error;
        }
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
    },

    /**
     * Publishes or unpublishes a quiz
     * @param {number|string} id - Quiz ID
     * @param {boolean} shouldPublish - Whether to publish (true) or unpublish (false)
     * @returns {Promise<Object>} Updated quiz object
     */
    publish: async (id, shouldPublish = true) => {
        // Handle mock mode
        if (isDev && useMockData) {
            console.log(`${shouldPublish ? 'Publishing' : 'Unpublishing'} mock quiz ${id}`);
            const index = mockQuizzes.findIndex(q => q.id === Number(id));
            if (index !== -1) {
                mockQuizzes[index].published = shouldPublish;
                return { ...mockQuizzes[index] };
            }
            throw new Error('Quiz not found');
        }

        try {
            // First try a dedicated publish endpoint if it exists
            try {
                console.log(`Setting quiz ${id} publish status to ${shouldPublish}`);
                const response = await api.put(`/quizzes/${id}/publish`, { published: shouldPublish });
                return response.data;
            } catch (publishError) {
                // If dedicated endpoint fails, fall back to standard update
                console.log('Publish endpoint failed, using regular update as fallback', publishError);

                // Get current quiz data first to avoid overwriting other fields
                const currentQuizResponse = await api.get(`/quizzes/${id}`);
                const currentQuiz = currentQuizResponse.data;

                // Create a properly formatted update object
                const updateData = {
                    ...currentQuiz,
                    published: shouldPublish
                };

                // Fix the category issue
                if (!updateData.category) {
                    delete updateData.category;
                } else if (typeof updateData.category === 'object' && updateData.category.id) {
                    updateData.category = updateData.category.id;
                }

                // Use PUT or POST depending on what your API expects
                try {
                    const response = await api.put(`/quizzes/${id}`, updateData);
                    return response.data;
                } catch (putError) {
                    // If PUT fails, try POST
                    if (putError.response && (putError.response.status === 405 || putError.response.status === 404)) {
                        const response = await api.post(`/quizzes/${id}`, updateData);
                        return response.data;
                    }
                    throw putError;
                }
            }
        } catch (error) {
            console.error(`Error ${shouldPublish ? 'publishing' : 'unpublishing'} quiz:`, error);

            if (error.response && error.response.data && error.response.data.message) {
                throw new Error(`Server error: ${error.response.data.message}`);
            }

            throw error;
        }
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