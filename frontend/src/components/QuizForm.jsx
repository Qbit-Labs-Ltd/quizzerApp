import React, { useState, useEffect, useRef } from 'react';
import '../styles/CommonStyles.css';
import { categoryApi } from '../utils/api'; // new import

/**
 * Form component for creating or editing quizzes
 * Handles both new quiz creation and editing existing quizzes
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Function called when form is submitted
 * @param {Object} props.initialData - Initial quiz data (when editing)
 * @param {Function} props.onCancel - Function called when form is cancelled
 * @param {boolean} props.isSubmitting - Whether form is currently submitting
 * @param {string|null} props.error - Error message to display
 * @param {Function} props.resetError - Function to reset error state
 * @returns {JSX.Element}
 */
const QuizForm = ({
  onSubmit,
  initialData = {},
  onCancel,
  isSubmitting = false,
  error = null,
  resetError = () => { }
}) => {
  // State for categories
  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Initialize form state once from initialData
  const formRef = useRef(null);
  const [formState, setFormState] = useState(() => ({
    name: initialData.name || '',
    description: initialData.description || '',
    courseCode: initialData.courseCode || '',
    published: initialData.published || false,
    category: initialData.category || ''
  }));

  // Only update form when initialData ID changes (new quiz being edited)
  const initialIdRef = useRef(initialData.id);

  useEffect(() => {
    // Only reset the form when we're editing a completely different quiz
    if (initialData.id && initialData.id !== initialIdRef.current) {
      initialIdRef.current = initialData.id;
      setFormState({
        name: initialData.name || '',
        description: initialData.description || '',
        courseCode: initialData.courseCode || '',
        published: initialData.published || false,
        category: initialData.category || ''
      });
    }
  }, [initialData.id]); // Only depend on ID changing

  // Use a debounced change handler to reduce flickering
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If user starts typing after an error, clear the error
    if (error) resetError();

    // Update local form state using functional update to ensure we have the latest state
    setFormState(prevState => {
      const newState = {
        ...prevState,
        [name]: type === 'checkbox' ? checked : value
      };
      return newState;
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      await onSubmit(formState);
      // Dispatch event to notify that quizzes have been updated
      window.dispatchEvent(new Event('quizzes-updated'));
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
            value={formState.name}
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
            value={formState.description}
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
            value={formState.courseCode}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="Enter course code"
            className={error && error.includes('Duplicate course code') ? 'has-error' : ''}
          />
          {error && error.includes('Duplicate course code') && (
            <p className="field-error">This course code is already in use</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="quiz-category">Category</label>
          <select
            id="quiz-category"
            name="category"
            value={formState.category}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="published"
              checked={formState.published}
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