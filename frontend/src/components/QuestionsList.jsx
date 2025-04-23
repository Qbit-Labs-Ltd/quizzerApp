import React from 'react';
import '../styles/CommonStyles.css';

const QuestionsList = ({ questions, quizName, onAddQuestion, onEditQuestion, onDeleteQuestion }) => {
    return (
        <div className="questions-container">
            <h1 className="page-title">Questions of "{quizName}"</h1>

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
                            <td>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onEditQuestion(question.id); }}
                                    className="question-link"
                                >
                                    {question.content}
                                </a>
                            </td>
                            <td>
                                <span className={`difficulty difficulty-${question.difficulty.toLowerCase()}`}>
                                    {question.difficulty}
                                </span>
                            </td>
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