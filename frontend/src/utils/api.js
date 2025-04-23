import axios from 'axios';
import { mockQuizzes, mockQuestions } from '../../mockData';

// Determine if we're in development mode
const isDev = true; // For now, always use mock data

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Generate unique IDs for mock data
const generateId = () => Math.floor(Math.random() * 10000);

// Quiz API
export const quizApi = {
    getAll: async () => {
        if (isDev) {
            console.log('Using mock quiz data');
            return mockQuizzes;
        }
        const response = await api.get('/quizzes');
        return response.data;
    },

    getById: async (id) => {
        if (isDev) {
            console.log(`Using mock data for quiz id: ${id}`);
            const quiz = mockQuizzes.find(q => q.id === Number(id));
            if (!quiz) throw new Error('Quiz not found');
            return quiz;
        }
        const response = await api.get(`/quizzes/${id}`);
        return response.data;
    },

    create: async (quizData) => {
        if (isDev) {
            console.log('Creating mock quiz', quizData);
            const newQuiz = {
                id: generateId(), // Use generateId instead of length+1
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

    update: async (id, quizData) => {
        if (isDev) {
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

    delete: async (id) => {
        if (isDev) {
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
    }
};

// Question API
export const questionApi = {
    getByQuizId: async (quizId) => {
        if (isDev) {
            console.log(`Getting mock questions for quiz id: ${quizId}`);
            return mockQuestions.filter(q => q.quizId === Number(quizId));
        }
        const response = await api.get(`/quizzes/${quizId}/questions`);
        return response.data;
    },

    create: async (quizId, questionData) => {
        if (isDev) {
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

    update: async (id, questionData) => {
        if (isDev) {
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

    delete: async (id) => {
        if (isDev) {
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

    getById: async (id) => {
        if (isDev) {
            console.log(`Getting mock question with id: ${id}`);
            const question = mockQuestions.find(q => q.id === Number(id));
            if (!question) throw new Error('Question not found');
            return question;
        }
        const response = await api.get(`/questions/${id}`);
        return response.data;
    }
};

// Answer API
export const answerApi = {
    delete: async (id) => {
        if (isDev) {
            console.log(`Deleting mock answer id: ${id}`);
            return true;
        }
        await api.delete(`/answers/${id}`);
        return true;
    }
};

export default api;