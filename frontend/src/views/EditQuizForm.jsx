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
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit">Update Quiz</button>
    </form>
  );
};

export default EditQuizForm;
