import React, { useState } from 'react';

const AddQuestionForm = ({ quiz, setQuiz }) => {
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['']);
  const [correctIndex, setCorrectIndex] = useState(0);

  const handleAddAnswer = () => {
    setAnswers([...answers, '']);
  };

  const handleChangeAnswer = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleDeleteAnswer = (index) => {
    const updatedAnswers = answers.filter((_, i) => i !== index);
    setAnswers(updatedAnswers);

    if (correctIndex === index) {
      setCorrectIndex(0);
    } else if (correctIndex > index) {
      setCorrectIndex(correctIndex - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newQuestion = {
      text: questionText,
      answers: answers,
      correctIndex: correctIndex,
    };

    // Add to quiz state
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion],
    });

    // Reset form
    setQuestionText('');
    setAnswers(['']);
    setCorrectIndex(0);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
  <input
    type="text"
    placeholder="Question"
    value={questionText}
    onChange={(e) => setQuestionText(e.target.value)}
    required
    style={{ padding: '0.5rem', fontSize: '1rem' }}
  />

  {answers.map((answer, index) => (
    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input
        type="text"
        placeholder={`Answer ${index + 1}`}
        value={answer}
        onChange={(e) => handleChangeAnswer(index, e.target.value)}
        required
        style={{ flexGrow: 1, padding: '0.4rem' }}
      />
      <label>
        <input
          type="radio"
          name="correctAnswer"
          checked={correctIndex === index}
          onChange={() => setCorrectIndex(index)}
        />
        Correct
      </label>
      <button type="button" onClick={() => handleDeleteAnswer(index)} style={{ padding: '0.3rem 0.5rem' }}>
        🗑️
      </button>
    </div>
  ))}

  <div style={{ display: 'flex', gap: '1rem' }}>
    <button type="button" onClick={handleAddAnswer} style={{ padding: '0.5rem 1rem' }}>
      ➕ Add Answer
    </button>
    <button type="submit" style={{ padding: '0.5rem 1rem' }}>
      ✅ Submit Question
    </button>
  </div>
</form>
  );
};

export default AddQuestionForm;
