import React from 'react';
import '../styles/CommonStyles.css';

const AnswerOptionsList = ({ question, answers, onAddAnswer, onDeleteAnswer }) => {
    return (
        <div className="answers-container">
            <h1 className="page-title">Answer options of "{question.content}"</h1>

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
                            <td>{answer.text}</td>
                            <td>
                                {answer.correct ? (
                                    <span className="correct">Correct</span>
                                ) : (
                                    <span className="not-correct">Not correct</span>
                                )}
                            </td>
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

            <div className="button-row">
                <button className="add-question-button" onClick={onAddAnswer}>
                    Add an answer option
                </button>
                <button className="cancel-button" onClick={() => window.history.back()}>
                    Back to questions
                </button>
            </div>
        </div>
    );
};

export default AnswerOptionsList;