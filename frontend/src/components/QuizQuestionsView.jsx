import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { questionApi, quizApi } from '../utils/api';
import QuestionBlock from './QuestionBlock';
import QuestionForm from './QuestionForm';
import QuestionSorter from './QuestionSorter';
import '../styles/Question.css';
import '../styles/CommonStyles.css';

/**
 * Component that displays and manages questions for a specific quiz
 * Provides functionality for:
 * - Viewing questions for a selected quiz
 * - Adding new questions
 * - Editing existing questions
 * - Deleting questions
 * - Sorting questions by different criteria
 * 
 * @param {Object} props - Component props
 * @param {Function} props.showToast - Function to display toast notifications
 * @param {Function} props.showDeleteConfirmation - Function to show confirmation dialog before deletion
 * @returns {JSX.Element}
 */
const QuizQuestionsView = ({ showToast, showDeleteConfirmation }) => {
    // Extract quiz ID from URL parameters
    const { id } = useParams();
    const navigate = useNavigate();

    // State management
    const [quiz, setQuiz] = useState(null);                            // Current quiz data
    const [questions, setQuestions] = useState([]);                    // List of questions for the quiz
    const [loading, setLoading] = useState(true);                      // Loading state indicator
    const [sortBy, setSortBy] = useState('orderAdded');               // Current sort method
    const [showAddQuestionForm, setShowAddQuestionForm] = useState(false); // Controls display of question form
    const [refreshQuestions, setRefreshQuestions] = useState(0);      // Counter to trigger question refresh

    /**
     * Fetch quiz and its questions when component mounts or dependencies change
     */
    useEffect(() => {
        const fetchQuizAndQuestions = async () => {
            try {
                setLoading(true);
                // Fetch the quiz data first
                const quizData = await quizApi.getById(id);
                setQuiz(quizData);
                // Then fetch all questions for this quiz
                const questionsData = await questionApi.getByQuizId(id);
                setQuestions(questionsData);
            } catch (err) {
                showToast('Failed to load quiz questions', 'error');
                navigate('/quizzes');
            } finally {
                setLoading(false);
            }
        };

        fetchQuizAndQuestions();
    }, [id, navigate, showToast, refreshQuestions]); // Re-fetch when these dependencies change

    /**
     * Handles adding a new question to the questions list
     * @param {Object} newQuestion - The newly created question
     */
    const handleQuestionAdded = (newQuestion) => {
        setQuestions([...questions, newQuestion]);
        showToast('Question added successfully!');
    };

    /**
     * Handles question deletion with confirmation
     * @param {number} questionId - ID of the question to delete
     */
    const handleDeleteQuestion = (questionId) => {
        // Optimistically remove from UI
        setQuestions(questions.filter(q => q.id !== questionId));

        // Show confirmation dialog
        showDeleteConfirmation(questionId, 'question');

        // Set up an event to refresh questions when modal closes
        const checkModalClosed = setInterval(() => {
            if (!document.querySelector('.modal-overlay')) {
                clearInterval(checkModalClosed);
                // Force a refresh of questions
                setRefreshQuestions(prev => prev + 1);
            }
        }, 500);
    };

    /**
     * Creates a new question via API
     * @param {Object} questionData - Data for the new question
     */
    const handleAddQuestion = (questionData) => {
        questionApi.create(id, questionData)
            .then(newQuestion => {
                setQuestions([...questions, newQuestion]);
                showToast('Question added successfully!');
                setShowAddQuestionForm(false);
            })
            .catch(err => {
                console.error('Error adding question:', err);
                showToast('Failed to add question', 'error');
            });
    };

    /**
     * Cancels the question creation process
     */
    const handleCancelAddQuestion = () => {
        setShowAddQuestionForm(false);
    };

    /**
     * Navigates to the question edit page
     * @param {number} questionId - ID of the question to edit
     */
    const handleEditQuestion = (questionId) => {
        navigate(`/questions/${questionId}/edit`, {
            state: {
                returnPath: `/quizzes/${id}/questions`,
                quizName: quiz?.name
            }
        });
    };

    /**
     * Sorts questions based on the selected sorting criteria
     */
    const sortedQuestions = [...questions].sort((a, b) => {
        switch (sortBy) {
            case 'difficultyAsc':
                const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                return diffOrder[a.difficulty] - diffOrder[b.difficulty];
            case 'difficultyDesc':
                const diffOrderDesc = { 'Easy': 3, 'Medium': 2, 'Hard': 1 };
                return diffOrderDesc[a.difficulty] - diffOrderDesc[b.difficulty];
            case 'contentAsc':
                return a.content.localeCompare(b.content);
            case 'contentDesc':
                return b.content.localeCompare(a.content);
            case 'orderAdded':
            default:
                return a.id - b.id;
        }
    });

    // Display loading indicator while fetching data
    if (loading) return <div className="loading">Loading questions...</div>;

    // Display error message if quiz not found
    if (!quiz) return <div className="error-message">Quiz not found</div>;

    // Show question form when adding a new question
    if (showAddQuestionForm) {
        return (
            <QuestionForm
                quizId={id}
                quizName={quiz.name}
                onSubmit={handleAddQuestion}
                onCancel={handleCancelAddQuestion}
            />
        );
    }

    // Main view displaying questions list
    return (
        <div className="quiz-questions-view">
            <div className="quiz-questions-header">
                <h1>Questions for {quiz.name}</h1>

                {/* Question sorting control */}
                <QuestionSorter
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    questionsCount={questions.length}
                />
            </div>

            {/* Display questions or empty state */}
            {sortedQuestions.length > 0 ? (
                sortedQuestions.map(question => (
                    <QuestionBlock
                        key={question.id}
                        question={question}
                        onDeleteQuestion={() => handleDeleteQuestion(question.id)}
                        onEditQuestion={() => handleEditQuestion(question.id)}
                        onDeleteAnswer={(questionId, answerId) => showDeleteConfirmation(answerId, 'answer')}
                        isEditMode={false} // Set to false in questions view
                    />
                ))
            ) : (
                <div className="empty-state">
                    <p>No questions added yet. Click "Add a question" to get started.</p>
                </div>
            )}

            {/* Action buttons */}
            <div className="button-row">
                <button
                    className="add-question-button"
                    onClick={() => setShowAddQuestionForm(true)}
                >
                    Add a question
                </button>
                <button className="cancel-button" onClick={() => navigate('/quizzes')}>
                    Back to quizzes
                </button>
            </div>
        </div>
    );
};

export default QuizQuestionsView;