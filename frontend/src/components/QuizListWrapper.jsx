import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizApi } from '../utils/api';
import QuizList from './QuizList';

const QuizListWrapper = ({ onDelete, ...props }) => {
    const navigate = useNavigate();

    // Use React Query to fetch quizzes
    const { data: quizzes = [], isLoading } = useQuery({
        queryKey: ['quizzes'],
        queryFn: () => quizApi.getAll()
    });

    return (
        <QuizList
            {...props}
            quizzes={quizzes}
            loading={isLoading}
            onEdit={(id) => navigate(`/quizzes/${id}/edit`)}
            onViewQuestions={(id) => navigate(`/quizzes/${id}/questions`)}
            onDelete={onDelete}
        />
    );
};

export default QuizListWrapper;