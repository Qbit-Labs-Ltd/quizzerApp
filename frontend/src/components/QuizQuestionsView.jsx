import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionSorter from './QuestionSorter';
import QuestionBlock from './QuestionBlock';
import QuestionForm from './QuestionForm';
import { quizApi, questionApi } from '../utils/api';

const QuizQuestionsView = ({ showToast, showDeleteConfirmation }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('orderAdded');
    const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
    const [refreshQuestions, setRefreshQuestions] = useState(0);

    useEffect(() => {
        const fetchQuizAndQuestions = async () => {
            try {
                setLoading(true);
                const quizData = await quizApi.getById(id);
                setQuiz(quizData);
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
    }, [id, navigate, showToast, refreshQuestions]);

    const handleQuestionAdded = (newQuestion) => {
        setQuestions([...questions, newQuestion]);
        showToast('Question added successfully!');
    };

    const handleDeleteQuestion = (questionId) => {
        // Optimistically remove from UI
        setQuestions(questions.filter(q => q.id !== questionId));

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

    const handleCancelAddQuestion = () => {
        setShowAddQuestionForm(false);
    };

    const handleEditQuestion = (questionId) => {
        navigate(`/questions/${questionId}/edit`, {
            state: {
                returnPath: `/quizzes/${id}/questions`,
                quizName: quiz?.name
            }
        });
    };

    // Sort questions based on sortBy value
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

    if (loading) return <div className="loading">Loading questions...</div>;
    if (!quiz) return <div className="error-message">Quiz not found</div>;

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

    return (
        <div className="quiz-questions-view">
            <div className="quiz-questions-header">
                <h1>Questions for {quiz.name}</h1>

                <QuestionSorter
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    questionsCount={questions.length}
                />
            </div>

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