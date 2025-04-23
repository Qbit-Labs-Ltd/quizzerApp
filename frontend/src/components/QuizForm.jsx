import React, { useState, useEffect } from 'react';
import '../styles/CommonStyles.css';

const QuizForm = ({
  onSubmit,
  initialData = {},
  onCancel,
  isSubmitting = false,
  error = null,
  resetError = () => { }
}) => {
  const [quiz, setQuiz] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    courseCode: initialData.courseCode || '',
    published: initialData.published || false
  });

  // Reset form if there was an error
  useEffect(() => {
    if (error && error.includes('Duplicate course code')) {
      // Clear just the course code if that's the error
      setQuiz(prev => ({
        ...prev,
        courseCode: ''
      }));
    }
    if (error && error.includes('Duplicate quiz name and course code')) {
      // Highlight both fields as problematic but don't clear them
      // The user needs to change at least one to proceed
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If user starts typing again after an error, clear the error
    if (error) resetError();

    setQuiz({
      ...quiz,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      await onSubmit(quiz);
    } catch (err) {
      console.error('Error in form submission:', err);
      // Error handling is now managed in QuizCreator
    }
  };

  return (
    <div className="quiz-form-container">
      {error && (
        <div className="error-message">
          {error.includes('Duplicate quiz name and course code')
            ? 'A quiz with this name and course code combination already exists. Please change either the name or course code.'
            : error.includes('Duplicate course code')
              ? 'A quiz for this course code already exists. Please use a different course code.'
              : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-group">
          <label htmlFor="quiz-name">Quiz name</label>
          <input
            type="text"
            id="quiz-name"
            name="name"
            value={quiz.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="Enter quiz name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="quiz-description">Description</label>
          <textarea
            id="quiz-description"
            name="description"
            value={quiz.description}
            onChange={handleChange}
            rows="3"
            disabled={isSubmitting}
            placeholder="Enter quiz description"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="quiz-course">Course code</label>
          <input
            type="text"
            id="quiz-course"
            name="courseCode"
            value={quiz.courseCode}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="Enter course code"
            className={error && error.includes('Duplicate course code') ? 'has-error' : ''}
          />
          {error && error.includes('Duplicate course code') && (
            <p className="field-error">This course code is already in use</p>
          )}
        </div>

        <div className="form-group checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="published"
              checked={quiz.published}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Published
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : initialData.id ? 'Save Changes' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;