import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '../utils/api';
import QuizForm from '../components/QuizForm';

const EditQuizView = ({
    quizId,
    showToast,
    handleUpdateQuiz,
    onCancel,
    onSuccess
}) => {
    const queryClient = useQueryClient();

    const { data: quiz, isLoading } = useQuery({
        queryKey: ['quiz', quizId],
        queryFn: () => quizApi.getById(quizId),
        onError: (err) => {
            console.error("Error fetching quiz:", err);
            showToast('Failed to load quiz', 'error');
            onCancel();
        }
    }); const handleUpdate = async (quizData) => {
        try {
            const updatedQuiz = await handleUpdateQuiz(quizId, quizData);
            queryClient.setQueryData(['quiz', quizId], updatedQuiz);
            queryClient.setQueryData(['quizzes'], (old) =>
                old?.map(q => q.id === quizId ? updatedQuiz : q)
            );
            // Show success message and trigger success callback but don't redirect
            if (typeof showToast === 'function') {
                showToast('Quiz updated successfully!');
            }
            onSuccess();
        } catch (err) {
            console.error("Error updating quiz:", err);
            if (typeof showToast === 'function') {
                showToast('Failed to update quiz', 'error');
            }
        }
    };

    if (isLoading) return <div className="loading">Loading quiz...</div>;
    if (!quiz) return <div className="error-message">Quiz not found</div>;

    return (
        <QuizForm
            initialData={{
                id: quiz.id,
                name: quiz.name,
                description: quiz.description,
                courseCode: quiz.courseCode,
                published: quiz.published,
                category: quiz.categoryId || ''
            }}
            onSubmit={handleUpdate}
            onCancel={onCancel}
        />
    );
};

export default EditQuizView;
