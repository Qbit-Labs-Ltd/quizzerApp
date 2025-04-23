import React, { useState } from 'react';
import '../styles/CommonStyles.css';

const AnswerOptionForm = ({ questionId, onSubmit, onCancel }) => {
    const [answerText, setAnswerText] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
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