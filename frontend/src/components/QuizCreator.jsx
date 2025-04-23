import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizForm from './QuizForm';
import QuestionForm from './QuestionForm';
import { questionApi } from '../utils/api';
import '../styles/CommonStyles.css';

const QuizCreator = ({ handleCreateQuiz, showToast }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState('quiz'); // 'quiz', 'questions'
    const [newQuiz, setNewQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    // Use ref to track if quiz was created
    const quizCreated = useRef(false);

    const resetQuizForm = () => {
        setIsSubmitting(false);
        setFormError(null);
    };

    const handleQuizSubmit = async (quizData) => {
        // Only create once
        if (quizCreated.current || isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError(null);

            const createdQuiz = await handleCreateQuiz(quizData);
            quizCreated.current = true;
            setNewQuiz(createdQuiz);
            setStep('questions');
        } catch (err) {
            console.error('Failed to create quiz:', err);
            setFormError(err.message || 'Failed to create quiz');
            resetQuizForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddQuestion = async (questionData) => {
        if (!newQuiz || !newQuiz.id) {
            showToast('Quiz not properly initialized', 'error');
            return;
        }

        try {
            const newQuestion = await questionApi.create(newQuiz.id, questionData);
            setQuestions([...questions, newQuestion]);
            setIsAddingQuestion(false);
            showToast('Question added successfully!');
        } catch (err) {
            console.error('Error adding question:', err);
            showToast('Failed to add question', 'error');
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            setQuestions(questions.filter(q => q.id !== questionId));
            await questionApi.delete(questionId);
            showToast('Question deleted successfully!');
        } catch (err) {
            console.error('Error deleting question:', err);
            showToast('Failed to delete question', 'error');
        }
    };

    const handleFinish = () => {
        navigate('/quizzes');
        showToast('Quiz creation complete!');
    };

    const handleCancel = () => {
        if (step === 'quiz') {
            navigate('/quizzes');
        } else if (step === 'questions') {
            if (confirm('Are you sure you want to cancel? Your quiz will remain but you can add questions later.')) {
                navigate('/quizzes');
            }
        }
    };

    // Quiz creation step
    if (step === 'quiz') {
        return (
            <div>
                <h1 className="page-title">Create New Quiz</h1>
                <QuizForm
                    onSubmit={handleQuizSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    error={formError}
                    resetError={() => setFormError(null)}
                />
            </div>
        );
    }

    // Question creation step
    if (step === 'questions') {
        if (isAddingQuestion) {
            return (
                <QuestionForm
                    quizId={newQuiz.id}
                    quizName={newQuiz.name}
                    onSubmit={handleAddQuestion}
                    onCancel={() => setIsAddingQuestion(false)}
                />
            );
        }

        return (
            <div className="quiz-creator-questions">
                <h1 className="page-title">Add Questions to "{newQuiz.name}"</h1>

                {questions.length > 0 ? (
                    <>
                        <h2 className="section-title">Added Questions:</h2>
                        <table className="question-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Difficulty</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map(question => (
                                    <tr key={question.id}>
                                        <td>{question.content}</td>
                                        <td>{question.difficulty}</td>
                                        <td>
                                            <button
                                                className="delete-btn danger"
                                                onClick={() => handleDeleteQuestion(question.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p className="info-text">No questions added yet. Click "Add a question" to get started.</p>
                )}

                <div className="button-row">
                    <button
                        className="add-question-button"
                        onClick={() => setIsAddingQuestion(true)}
                    >
                        Add a question
                    </button>
                    <button
                        className="submit-button"
                        onClick={handleFinish}
                    >
                        Finish
                    </button>
                </div>
            </div>
        );
    }
};

export default QuizCreator;