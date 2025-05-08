import React, { useEffect, useState } from 'react';

const EditQuizForm = ({ existingQuiz }) => {
  const [quizData, setQuizData] = useState(existingQuiz);
  const [localFormData, setLocalFormData] = useState(existingQuiz);

  useEffect(() => {
    if (existingQuiz) {
      setQuizData(existingQuiz);
      setLocalFormData(existingQuiz);
    }
  }, [existingQuiz]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setQuizData(localFormData);
    try {
      const result = await quizApi.update(existingQuiz.id, localFormData);
      console.log('Quiz updated successfully:', result);
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  /**
 * Handles quiz update submission
 * @param {Object} quizData - The updated quiz data
 */
  const handleUpdate = async (quizData) => {
    try {
      await handleUpdateQuiz(id, quizData);

      // Dispatch a custom event to notify components that quizzes have changed
      window.dispatchEvent(new CustomEvent('quizzes-updated'));

      navigate('/quizzes');
    } catch (err) {
      console.error("Error updating quiz:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <input
        name="title"
        placeholder="Quiz Title"
        value={localFormData.title || ''}
        onChange={handleInputChange}
        style={{ flexGrow: 1, padding: '0.5rem' }}
      />
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        Update Quiz
      </button>
    </form>
  );
};

export default EditQuizForm;
