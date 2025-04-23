import React from 'react';
import '../styles/CommonStyles.css';

/**
 * Component for displaying a list of answer options for a question
 * Shows answer text, correctness status, and delete buttons
 * 
 * @param {Object} props - Component props
 * @param {Object} props.question - The question these answers belong to
 * @param {Array} props.answers - Array of answer objects to display
 * @param {Function} props.onAddAnswer - Function called when add answer is clicked
 * @param {Function} props.onDeleteAnswer - Function called when delete answer is clicked
 * @returns {JSX.Element}
 */
const AnswerOptionsList = ({ question, answers, onAddAnswer, onDeleteAnswer }) => {
    return (
        <div className="answers-container">
            <h1 className="page-title">Answer options of "{question.content}"</h1>

            {/* Table for displaying answer options */}
            <table className="answer-table">
                <thead>
                    <tr>
                        <th>Answer option text</th>
                        <th>Correctness</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {answers.map(answer => (
                        <tr key={answer.id}>
                            {/* Answer text */}
                            <td>{answer.text}</td>

                            {/* Correctness status */}
                            <td>
                                {answer.correct ? (
                                    <span className="correct">Correct</span>
                                ) : (
                                    <span className="not-correct">Not correct</span>
                                )}
                            </td>

                            {/* Delete button */}
                            <td>
                                <button
                                    className="delete-btn danger"
                                    onClick={() => onDeleteAnswer(answer.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Action buttons */}
            <div className="button-row">
                <button
                    className="add-answer-button"
                    onClick={onAddAnswer}
                >
                    Add an answer option
                </button>
            </div>
        </div>
    );
};

export default AnswerOptionsList;