import React, { useState } from 'react';
import '../styles/CommonStyles.css';

/**
 * Form component for creating or editing answer options
 * Handles text input and correct/incorrect status
 * 
 * @param {Object} props - Component props
 * @param {number} props.questionId - ID of the question this answer belongs to
 * @param {Function} props.onSubmit - Function called when form is submitted
 * @param {Function} props.onCancel - Function called when form is cancelled
 * @returns {JSX.Element}
 */
const AnswerOptionForm = ({ questionId, onSubmit, onCancel }) => {
    // Form state
    const [answerText, setAnswerText] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    /**
     * Handles form submission
     * @param {Event} e - Form submit event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        // Pass answer data to parent component
        onSubmit({
            text: answerText,
            correct: isCorrect,
            questionId
        });
    };

    return (
        <div className="answer-form-container">
            <h1 className="page-title">Add an answer option</h1>

            <form onSubmit={handleSubmit} className="answer-form">
                {/* Answer text input */}
                <div className="form-group">
                    <label htmlFor="answer-text">Answer option text</label>
                    <input
                        type="text"
                        id="answer-text"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        required
                        placeholder="Enter answer text"
                    />
                </div>

                {/* Correct answer checkbox */}
                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={isCorrect}
                            onChange={(e) => setIsCorrect(e.target.checked)}
                        />
                        Correct answer
                    </label>
                </div>

                {/* Form action buttons */}
                <div className="form-actions">
                    <button type="button" className="cancel-button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-button">
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AnswerOptionForm;