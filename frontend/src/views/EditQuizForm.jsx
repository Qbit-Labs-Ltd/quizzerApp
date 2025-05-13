import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '../utils/api';

const EditQuizForm = ({ existingQuiz, onSuccess }) => {
  const [localFormData, setLocalFormData] = useState(existingQuiz);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (existingQuiz) {
      setLocalFormData(existingQuiz);
    }
  }, [existingQuiz]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const updateMutation = useMutation({
    mutationFn: (quizData) => quizApi.update(existingQuiz.id, quizData),
    onMutate: async (newQuizData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['quizzes'] });
      await queryClient.cancelQueries({ queryKey: ['quiz', existingQuiz.id] });

      // Snapshot the previous value
      const previousQuizzes = queryClient.getQueryData(['quizzes']);
      const previousQuiz = queryClient.getQueryData(['quiz', existingQuiz.id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['quizzes'], (old) =>
        old.map(quiz => quiz.id === existingQuiz.id ? { ...quiz, ...newQuizData } : quiz)
      );
      queryClient.setQueryData(['quiz', existingQuiz.id], (old) => ({
        ...old,
        ...newQuizData
      }));

      // Return a context object with the snapshotted value
      return { previousQuizzes, previousQuiz };
    },
    onError: (err, newQuizData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousQuizzes) {
        queryClient.setQueryData(['quizzes'], context.previousQuizzes);
      }
      if (context?.previousQuiz) {
        queryClient.setQueryData(['quiz', existingQuiz.id], context.previousQuiz);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', existingQuiz.id] });
    },
    onSuccess: (updatedQuiz) => {
      // Update local state with the server response
      setLocalFormData(updatedQuiz);
      // Update the cache with the server response
      queryClient.setQueryData(['quiz', existingQuiz.id], updatedQuiz);
      queryClient.setQueryData(['quizzes'], (old) =>
        old.map(quiz => quiz.id === existingQuiz.id ? updatedQuiz : quiz)
      );
      if (onSuccess) onSuccess(updatedQuiz);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(localFormData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <input
        name="name"
        placeholder="Quiz Title"
        value={localFormData.name || ''}
        onChange={handleInputChange}
        style={{ flexGrow: 1, padding: '0.5rem' }}
      />
      <button
        type="submit"
        style={{ padding: '0.5rem 1rem' }}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? 'Updating...' : 'Update Quiz'}
      </button>
    </form>
  );
};

export default EditQuizForm;
