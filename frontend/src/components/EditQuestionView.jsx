import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import QuestionForm from './QuestionForm';
import { questionApi } from '../utils/api';

const EditQuestionView = ({ showToast }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = location.state?.returnPath || '/quizzes';
    const quizName = location.state?.quizName || '';

    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const handleCancel = () => {
        navigate(returnPath);
    };

    if (loading) return <div className="loading">Loading question...</div>;
    if (!question) return <div className="error-message">Question not found</div>;

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