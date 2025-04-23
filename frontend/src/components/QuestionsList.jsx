import React from 'react';
import '../styles/CommonStyles.css';

/**
 * Component that displays a table of questions for a specific quiz
 * Provides functionality for adding, editing, and deleting questions
 * 
 * @param {Object} props - Component props
 * @param {Array} props.questions - Array of question objects to display
 * @param {string} props.quizName - Name of the quiz these questions belong to
 * @param {Function} props.onAddQuestion - Function called when add question button is clicked
 * @param {Function} props.onEditQuestion - Function called when edit button is clicked
 * @param {Function} props.onDeleteQuestion - Function called when delete button is clicked
 * @returns {JSX.Element}
 */
const QuestionsList = ({ questions, quizName, onAddQuestion, onEditQuestion, onDeleteQuestion }) => {
    return (
        <div className="questions-container">
            {/* Page header with quiz name */}
            <h1 className="page-title">Questions of "{quizName}"</h1>

            {/* Table for displaying questions */}
            <table className="question-table">
                <thead>
                    <tr>
                        <th>Question text</th>
                        <th>Difficulty</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {questions.map(question => (
                        <tr key={question.id}>
                            {/* Question text with clickable link */}
                            <td>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onEditQuestion(question.id); }}
                                    className="question-link"
                                >
                                    {question.content}
                                </a>
                            </td>
                            {/* Difficulty indicator with color coding */}
                            <td>
                                <span className={`difficulty difficulty-${question.difficulty.toLowerCase()}`}>
                                    {question.difficulty}
                                </span>
                            </td>
                            {/* Action buttons for each question */}
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="edit-btn"
                                        onClick={() => onEditQuestion(question.id)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn danger"
                                        onClick={() => onDeleteQuestion(question.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Action buttons at bottom of page */}
            <div className="button-row">
                <button className="add-question-button" onClick={onAddQuestion}>
                    Add a question
                </button>
                <button className="cancel-button" onClick={() => window.history.back()}>
                    Back to quizzes
                </button>
            </div>
        </div>
    );
};

export default QuestionsList;