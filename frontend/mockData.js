// Mock data to use when backend isn't connected
export const mockQuizzes = [
    {
        id: 1,
        name: "JavaScript Fundamentals",
        description: "Test your knowledge of JavaScript basics",
        courseCode: "JS101",
        published: true,
        questionCount: 3
    },
    {
        id: 2,
        name: "React Essentials",
        description: "Learn the core concepts of React",
        courseCode: "REACT200",
        published: false,
        questionCount: 0
    },
    {
        id: 5,
        name: "Python Basics",
        description: "Introduction to Python programming",
        courseCode: "PY101",
        published: true,
        questionCount: 2
    }
];

export const mockQuestions = [
    {
        id: 1,
        content: "What is JavaScript?",
        difficulty: "Easy",
        quizId: 1,
        answers: [
            { id: 1, text: "A programming language", correct: true },
            { id: 2, text: "A markup language", correct: false },
            { id: 3, text: "A database", correct: false }
        ]
    },
    {
        id: 2,
        content: "What does JSX stand for?",
        difficulty: "Medium",
        quizId: 1,
        answers: [
            { id: 4, text: "JavaScript XML", correct: true },
            { id: 5, text: "JavaScript Extension", correct: false },
            { id: 6, text: "Java Syntax Extension", correct: false }
        ]
    },
    {
        id: 3,
        content: "Which hook is used for side effects in React?",
        difficulty: "Hard",
        quizId: 1,
        answers: [
            { id: 7, text: "useEffect", correct: true },
            { id: 8, text: "useState", correct: false },
            { id: 9, text: "useContext", correct: false }
        ]
    },
    {
        id: 4,
        content: "What is Python?",
        difficulty: "Easy",
        quizId: 5,
        answers: [
            { id: 10, text: "A programming language", correct: true },
            { id: 11, text: "A snake", correct: false },
            { id: 12, text: "A database", correct: false }
        ]
    },
    {
        id: 5,
        content: "What is the Python package manager called?",
        difficulty: "Easy",
        quizId: 5,
        answers: [
            { id: 13, text: "pip", correct: true },
            { id: 14, text: "npm", correct: false },
            { id: 15, text: "yarn", correct: false }
        ]
    }
];