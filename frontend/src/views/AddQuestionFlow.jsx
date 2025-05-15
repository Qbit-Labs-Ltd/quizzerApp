import React, { useState } from 'react';
import { questionApi } from '../utils/api';
import '../styles/CommonStyles.css';
import '../styles/Question.css';

const AddQuestionFlow = ({ quizId, onQuestionAdded }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState({
    content: '',
    difficulty: 'Medium',
    answers: [{ text: '', correct: true }, { text: '', correct: false }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateAnswer = (index, field, value) => {
    const updatedAnswers = [...question.answers];
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      [field]: value
    };

    // If we're setting an answer as correct, make sure others are not correct
    if (field === 'correct' && value === true) {
      updatedAnswers.forEach((answer, i) => {
        if (i !== index) {
          updatedAnswers[i].correct = false;
        }
      });
    }

    setQuestion({
      ...question,
      answers: updatedAnswers
    });
  };

  const addAnswerOption = () => {
    setQuestion({
      ...question,
      answers: [...question.answers, { text: '', correct: false }]
    });
  };

  const removeAnswerOption = (index) => {
    const updatedAnswers = question.answers.filter((_, i) => i !== index);

    // Make sure at least one answer is marked as correct
    const hasCorrect = updatedAnswers.some(answer => answer.correct);
    if (!hasCorrect && updatedAnswers.length > 0) {
      updatedAnswers[0].correct = true;
    }

    setQuestion({
      ...question,
      answers: updatedAnswers
    });
  };

  const resetForm = () => {
    setStep(1);
    setQuestion({
      content: '',
      difficulty: 'Medium',
      answers: [{ text: '', correct: true }, { text: '', correct: false }]
    });
    setIsExpanded(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Format the question data for API
      const questionData = {
        content: question.content,
        difficulty: question.difficulty,
        answers: question.answers
      };

      // Call API to save question
      const newQuestion = await questionApi.create(quizId, questionData);

      // After success:
      onQuestionAdded(newQuestion);
      resetForm();
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="add-question-collapsed">
        <button
          className="add-question-button"
          onClick={() => setIsExpanded(true)}
        >
          + Add New Question
        </button>
      </div>
    );
  }

  return (
    <div className="add-question-flow">
      <div className="add-question-header">
        <h3>Add New Question</h3>
        <button className="close-btn" onClick={resetForm}>×</button>
      </div>

      <div className="step-indicator">
        <div className={`step ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Create Question</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${step === 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Add Answers</div>
        </div>
      </div>

      {step === 1 && (
        <div className="question-step">
          <div className="form-group">
            <label htmlFor="question-content">Question Text:</label>
            <textarea
              id="question-content"
              value={question.content}
              onChange={(e) => setQuestion({ ...question, content: e.target.value })}
              placeholder="Enter your question here..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="question-difficulty">Difficulty:</label>
            <select
              id="question-difficulty"
              value={question.difficulty}
              onChange={(e) => setQuestion({ ...question, difficulty: e.target.value })}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="step-actions">
            <button className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
            <button
              className="next-btn"
              onClick={() => setStep(2)}
              disabled={!question.content.trim()}
            >
              Next: Add Answer Options
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="answers-step">
          {question.answers.map((answer, index) => (
            <div key={index} className="answer-form-group">
              <input
                type="text"
                value={answer.text}
                onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                placeholder={`Answer option ${index + 1}`}
                required
              />

              <label className="correct-answer-label">
                <input
                  type="radio"
                  name="correct-answer"
                  checked={answer.correct}
                  onChange={() => updateAnswer(index, 'correct', true)}
                />
                Correct Answer
              </label>

              {question.answers.length > 2 && (
                <button
                  className="remove-answer-btn"
                  onClick={() => removeAnswerOption(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button className="add-answer-btn" onClick={addAnswerOption}>
            + Add Another Answer Option
          </button>

          <div className="step-actions">
            <button className="back-btn" onClick={() => setStep(1)}>
              Back to Question
            </button>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={
                !question.content ||
                question.answers.some(a => !a.text.trim()) ||
                isSubmitting
              }
            >
              {isSubmitting ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddQuestionFlow;