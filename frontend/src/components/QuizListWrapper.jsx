import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '../utils/api';
import QuizList from './QuizList';

const QuizListWrapper = ({ onDelete, showToast, ...props }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Use React Query to fetch quizzes with proper cache handling
    const { data: quizzes = [], isLoading } = useQuery({
        queryKey: ['quizzes'],
        queryFn: () => quizApi.getAll(),
        staleTime: 0, // Consider data stale immediately
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnMount: true, // Refetch when component mounts
        refetchOnReconnect: true // Refetch when reconnecting
    });

    // Listen for quiz updates
    React.useEffect(() => {
        const handleQuizUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        };

        window.addEventListener('quizzes-updated', handleQuizUpdate);
        return () => {
            window.removeEventListener('quizzes-updated', handleQuizUpdate);
        };
    }, [queryClient]);    // Handle quiz edit directly with a modal instead of navigation
    const handleEdit = async (id, quizData) => {
        try {
            const updatedQuiz = await quizApi.update(id, quizData);
            // Update the cache with the server response
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
            return updatedQuiz;
        } catch (error) {
            console.error("Error updating quiz:", error);
            throw error;
        }
    }; return (
        <QuizList
            {...props}
            quizzes={quizzes}
            loading={isLoading}
            onEdit={handleEdit}
            onViewQuestions={(id) => navigate(`/quizzes/${id}/questions`)}
            onDelete={onDelete}
            showToast={showToast}
        />
    );
};

export default QuizListWrapper;