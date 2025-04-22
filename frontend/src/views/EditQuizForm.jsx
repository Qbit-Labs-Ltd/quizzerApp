import React, { useEffect, useState } from 'react';

const EditQuizForm = ({ existingQuiz }) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (existingQuiz) {
      setTitle(existingQuiz.title);
    }
  }, [existingQuiz]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated title:', title);
    // Hook up to PUT /api/quiz/:id later
  };

  return (
  <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
  <input
    placeholder="Quiz Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    style={{ flexGrow: 1, padding: '0.5rem' }}
  />
  <button type="submit" style={{ padding: '0.5rem 1rem' }}>
    Update Quiz
  </button>
</form>

  );
};

export default EditQuizForm;
