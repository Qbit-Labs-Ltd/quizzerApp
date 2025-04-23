import React, { useState, useEffect } from 'react';
import '../styles/CommonStyles.css';

/**
 * Form component for creating or editing quiz questions
 * Handles question creation, answer options, and validation
 * 
 * @param {Object} props - Component props
 * @param {number} props.quizId - ID of the quiz this question belongs to
 * @param {string} props.quizName - Name of the quiz for display purposes
 * @param {Function} props.onSubmit - Function called when form is submitted
 * @param {Function} props.onCancel - Function called when form is cancelled
 * @param {Object} props.initialData - Initial question data (when editing)
 * @param {boolean} props.isEditing - Whether we're editing an existing question
 * @returns {JSX.Element}
 */
const QuestionForm = ({ quizId, quizName, onSubmit, onCancel, initialData, isEditing = false }) => {
    // Question form state
    const [questionText, setQuestionText] = useState(initialData?.content || '');
    const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'Easy');
    const [answerOptions, setAnswerOptions] = useState(initialData?.answers || []);
    const [newAnswerText, setNewAnswerText] = useState('');
    const [newAnswerCorrect, setNewAnswerCorrect] = useState(false);

    /**
     * Initialize form with initial data when provided
     */
    useEffect(() => {
        if (initialData) {
            setQuestionText(initialData.content || '');
            setDifficulty(initialData.difficulty || 'Easy');
            setAnswerOptions(initialData.answers || []);
        }
    }, [initialData]);

    /**
     * Adds a new answer option to the question
     */
    const handleAddAnswerOption = () => {
        if (!newAnswerText.trim()) return;

        const newAnswer = {
            id: Date.now(), // Temporary ID for UI purposes
            text: newAnswerText,
            correct: newAnswerCorrect
        };

        setAnswerOptions([...answerOptions, newAnswer]);
        setNewAnswerText('');
        setNewAnswerCorrect(false);
    };

    /**
     * Removes an answer option from the question
     * @param {number} id - ID of the answer to delete
     */
    const handleDeleteAnswerOption = (id) => {
        setAnswerOptions(answerOptions.filter(answer => answer.id !== id));
    };

    /**
     * Toggles the correctness status of an answer option
     * @param {number} answerId - ID of the answer to toggle
     */
    const handleCorrectAnswerChange = (answerId) => {
        // Update only the toggled answer, leaving others unchanged
        const updatedOptions = answerOptions.map(answer => {
            if (answer.id === answerId) {
                // Toggle the correct state of this answer
                return {
                    ...answer,
                    correct: !answer.correct
                };
            }
            // Leave other answers unchanged
            return answer;
        });

        setAnswerOptions(updatedOptions);
    };

    /**
     * Handles form submission with validation
     * @param {Event} e - Form submit event
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate at least one answer is marked as correct
        const hasCorrectAnswer = answerOptions.some(answer => answer.correct);

        if (answerOptions.length < 2) {
            showToast("Please add at least two answer options.", "error");
            return;
        }

        if (!hasCorrectAnswer) {
            showToast("At least one answer must be marked as correct.", "error");
            return;
        }

        onSubmit({
            content: questionText,
            difficulty,
            answers: answerOptions
        });
    };

    return (
        <div className="question-form-container">
            <h1 className="page-title">
                {isEditing ? `Edit question for "${quizName}"` : `Add a question to "${quizName}"`}
            </h1>

            <form onSubmit={handleSubmit} className="question-form">
                <div className="form-group">
                    <label htmlFor="question-text">Question text</label>
                    <input
                        type="text"
                        id="question-text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        required
                        placeholder="Enter question text"
                    />
                </div>

                <div className="form-group">
                    <label>Difficulty</label>
                    <div className="radio-group">
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="difficulty"
                                value="Easy"
                                checked={difficulty === 'Easy'}
                                onChange={() => setDifficulty('Easy')}
                            />
                            Easy
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="difficulty"
                                value="Normal"
                                checked={difficulty === 'Normal'}
                                onChange={() => setDifficulty('Normal')}
                            />
                            Normal
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="difficulty"
                                value="Hard"
                                checked={difficulty === 'Hard'}
                                onChange={() => setDifficulty('Hard')}
                            />
                            Hard
                        </label>
                    </div>
                </div>

                {/* Answer Options Section */}
                <div className="form-group answer-options-section">
                    <label>Answer Options</label>

                    {answerOptions.length > 0 ? (
                        <div className="added-answer-options">
                            {answerOptions.map((answer, index) => (
                                <div key={answer.id} className={`answer-option ${answer.correct ? 'correct-answer' : ''}`}>
                                    <span className="answer-text">{answer.text}</span>
                                    <div className="answer-actions">
                                        {answer.correct && <span className="correct-indicator">✓</span>}
                                        <label className="correct-answer-label">
                                            <input
                                                type="checkbox"
                                                checked={answer.correct}
                                                onChange={() => handleCorrectAnswerChange(answer.id)}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            className="delete-answer-btn"
                                            onClick={() => handleDeleteAnswerOption(answer.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="info-text">No answer options added yet.</p>
                    )}

                    {/* Add new answer option form */}
                    <div className="answer-form-group">
                        <input
                            type="text"
                            value={newAnswerText}
                            onChange={(e) => setNewAnswerText(e.target.value)}
                            placeholder="Enter answer option"
                            className="answer-input"
                        />
                        <label className="correct-answer-label">
                            <input
                                type="checkbox"
                                checked={newAnswerCorrect}
                                onChange={(e) => setNewAnswerCorrect(e.target.checked)}
                            />
                            Correct answer
                        </label>
                        <button
                            type="button"
                            className="add-answer-btn"
                            onClick={handleAddAnswerOption}
                            disabled={!newAnswerText.trim()}
                        >
                            Add
                        </button>
                    </div>

                    {answerOptions.length < 2 && (
                        <p className="hint-text">Add at least 2 answer options.</p>
                    )}
                    {!answerOptions.some(a => a.correct) && answerOptions.length > 0 && (
                        <p className="warning-text">At least one answer must be correct.</p>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={answerOptions.length < 2 || !answerOptions.some(a => a.correct)}
                    >
                        {isEditing ? 'Save Changes' : 'Add'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionForm;