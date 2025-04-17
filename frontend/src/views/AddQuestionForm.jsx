import React, { useState } from 'react';

const AddQuestionForm = () => {
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

    // Reset correctIndex if necessary
    if (correctIndex === index) {
      setCorrectIndex(0);
    } else if (correctIndex > index) {
      setCorrectIndex(correctIndex - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newQuestion = {
      questionText,
      answers,
      correctIndex
    };

    console.log('Submitted question:', newQuestion);

    // TODO: Replace console.log with a backend POST request when ready
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add a New Question</h2>

      <input
        type="text"
        placeholder="Question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        required
      />

      <h3>Answers</h3>
      {answers.map((answer, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <input
            type="text"
            placeholder={`Answer ${index + 1}`}
            value={answer}
            onChange={(e) => handleChangeAnswer(index, e.target.value)}
            required
            style={{ marginRight: 8 }}
          />
          <label style={{ marginRight: 8 }}>
            <input
              type="radio"
              name="correctAnswer"
              checked={correctIndex === index}
              onChange={() => setCorrectIndex(index)}
            />
            Correct
          </label>
          <button type="button" onClick={() => handleDeleteAnswer(index)}>🗑️</button>
        </div>
      ))}

      <button type="button" onClick={handleAddAnswer} style={{ marginBottom: 16 }}>
        ➕ Add Answer
      </button>

      <br />
      <button type="submit">✅ Submit Question</button>
    </form>
  );
};

export default AddQuestionForm;
