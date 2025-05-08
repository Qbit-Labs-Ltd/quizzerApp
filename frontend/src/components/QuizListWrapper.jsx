import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../utils/api';
import QuizList from './QuizList';

const QuizListWrapper = (props) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [quizzes, setQuizzes] = useState(props.quizzes || []);
    const [loading, setLoading] = useState(false);

    // Fetch quizzes when refresh trigger changes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                const data = await quizApi.getAll();
                setQuizzes(data);
            } catch (err) {
                console.error('Failed to fetch quizzes:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, [refreshTrigger]);

    // Listen for the custom quizzes-updated event
    useEffect(() => {
        const handleQuizzesUpdated = () => {
            // Increment the refresh trigger to force a refresh
            setRefreshTrigger(prev => prev + 1);
        };

        // Add event listener
        window.addEventListener('quizzes-updated', handleQuizzesUpdated);

        // Clean up
        return () => {
            window.removeEventListener('quizzes-updated', handleQuizzesUpdated);
        };
    }, []);

    return (
        <QuizList
            {...props}
            quizzes={quizzes}
            loading={loading}
            refreshTrigger={refreshTrigger}
            onEdit={(id) => navigate(`/quizzes/${id}/edit`)}
            onViewQuestions={(id) => navigate(`/quizzes/${id}/questions`)}
        />
    );
};

export default QuizListWrapper;