import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import QuestionForm from './QuestionForm';
import { questionApi } from '../utils/api';

/**
 * Component for editing an existing question
 * Fetches question data, handles updates, and navigation
 * 
 * @param {Object} props - Component props
 * @param {Function} props.showToast - Function to display toast notifications
 * @returns {JSX.Element}
 */
const EditQuestionView = ({ showToast }) => {
    // Get question ID from URL parameters
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get return path and quiz name from location state or use defaults
    const returnPath = location.state?.returnPath || '/quizzes';
    const quizName = location.state?.quizName || '';

    // State management
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Fetch question data when component mounts
     */
    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setLoading(true);
                const data = await questionApi.getById(id);
                setQuestion(data);
            } catch (err) {
                console.error("Error fetching question:", err);
                showToast('Failed to load question', 'error');
                navigate(returnPath);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [id, navigate, showToast, returnPath]);

    /**
     * Handles updating the question with new data
     * @param {Object} questionData - The updated question data
     */
    const handleUpdate = async (questionData) => {
        try {
            await questionApi.update(id, questionData);
            showToast('Question updated successfully!');
            navigate(returnPath);
        } catch (err) {
            console.error("Error updating question:", err);
            showToast('Failed to update question', 'error');
        }
    };

    /**
     * Handles cancellation of question editing
     */
    const handleCancel = () => {
        navigate(returnPath);
    };

    // Show loading indicator while fetching data
    if (loading) return <div className="loading">Loading question...</div>;

    // Show error message if question not found
    if (!question) return <div className="error-message">Question not found</div>;

    // Render question form with existing question data
    return (
        <QuestionForm
            initialData={question}
            quizId={question.quizId}
            quizName={quizName}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            isEditing={true}
        />
    );
};

export default EditQuestionView;