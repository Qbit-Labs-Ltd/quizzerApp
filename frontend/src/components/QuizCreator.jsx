import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionApi } from '../utils/api';
import QuestionForm from './QuestionForm';
import QuizForm from './QuizForm';
import '../styles/CommonStyles.css';
import '../styles/Quizzes.css';

/**
 * Multi-step component for creating a new quiz and its questions
 * Handles the complete flow from quiz creation to adding multiple questions
 * 
 * @param {Object} props - Component props
 * @param {Function} props.handleCreateQuiz - Function to handle quiz creation API call
 * @param {Function} props.showToast - Function to display toast notifications
 * @param {Function} props.onCancel - Function to handle cancel action
 * @returns {JSX.Element}
 */
const QuizCreator = ({ handleCreateQuiz, showToast, onCancel }) => {
    const navigate = useNavigate();

    // State management
    const [step, setStep] = useState('quiz'); // Flow control: 'quiz', 'questions'
    const [newQuiz, setNewQuiz] = useState(null); // Stores the created quiz data
    const [questions, setQuestions] = useState([]); // List of questions added
    const [isAddingQuestion, setIsAddingQuestion] = useState(false); // Controls question form display
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state indicator
    const [formError, setFormError] = useState(null); // Form validation errors

    // Use ref to track if quiz was created to prevent duplicate creation
    const quizCreated = useRef(false);

    /**
     * Resets the form state when needed
     */
    const resetQuizForm = () => {
        setIsSubmitting(false);
        setFormError(null);
    };

    /**
     * Handles the quiz creation step
     * @param {Object} quizData - Data for the new quiz
     */
    const handleQuizSubmit = async (quizData) => {
        try {
            setIsSubmitting(true);
            console.log("Submitting quiz data:", quizData);

            // Ensure all required fields are present
            const quizToSubmit = {
                name: quizData.name || "",
                description: quizData.description || "",
                courseCode: quizData.courseCode || "",
                published: quizData.published || false,
                category: quizData.category
                    ? { id: parseInt(quizData.category) }
                    : null
            };

            // Create quiz via API
            const response = await handleCreateQuiz(quizToSubmit);
            quizCreated.current = true;
            setNewQuiz(response);
            setStep('questions'); // Move to questions step
        } catch (error) {
            console.error("Failed to create quiz:", error);
            // Extract detailed error message if available
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create quiz';
            setFormError(errorMessage);
            showToast(`Error: ${errorMessage}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Handles adding a new question to the quiz
     * @param {Object} questionData - Data for the new question
     */
    const handleAddQuestion = async (questionData) => {
        if (!newQuiz || !newQuiz.id) {
            showToast('Quiz not properly initialized', 'error');
            return;
        }

        try {
            // Format the question data properly
            const formattedQuestion = {
                content: questionData.content,
                difficulty: questionData.difficulty,
                answers: questionData.answers.map(answer => ({
                    text: answer.text,
                    correct: answer.correct
                }))
            };

            console.log("Sending question data:", formattedQuestion);

            // Create question via API
            const newQuestion = await questionApi.create(newQuiz.id, formattedQuestion);
            setQuestions([...questions, newQuestion]);
            setIsAddingQuestion(false);
            showToast('Question added successfully!');
        } catch (err) {
            console.error('Error adding question:', err);
            showToast('Failed to add question', 'error');
        }
    };

    /**
     * Handles deletion of a question
     * @param {number} questionId - ID of the question to delete
     */
    const handleDeleteQuestion = async (questionId) => {
        try {
            // Optimistically update UI
            setQuestions(questions.filter(q => q.id !== questionId));
            // Delete from backend
            await questionApi.delete(questionId);
            showToast('Question deleted successfully!');
        } catch (err) {
            console.error('Error deleting question:', err);
            showToast('Failed to delete question', 'error');
        }
    };

    /**
     * Finishes the quiz creation process and navigates back to quizzes
     */
    const handleFinish = () => {
        navigate('/quizzes');
        showToast('Quiz creation complete!');
    };

    /**
     * Handles cancellation based on current step
     */
    const handleCancel = () => {
        if (step === 'quiz') {
            onCancel(); // Use the provided onCancel prop
        } else if (step === 'questions') {
            if (confirm('Are you sure you want to cancel? Your quiz will remain but you can add questions later.')) {
                navigate('/quizzes');
            }
        }
    };

    // Quiz creation step
    if (step === 'quiz') {
        return (
            <div className="quiz-creator">
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
        // Show question form when adding a new question
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

        // Show questions list view
        return (
            <div className="quiz-creator-questions">
                <h1 className="page-title">Add Questions to "{newQuiz.name}"</h1>

                {/* Show questions list or empty state */}
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

                {/* Action buttons */}
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