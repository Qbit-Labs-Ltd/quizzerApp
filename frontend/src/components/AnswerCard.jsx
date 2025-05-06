import React from 'react';
import RadioGroup from './RadioGroup';

/**
 * Component for displaying a question with its answer options as radio buttons
 * 
 * @param {Object} props - Component props
 * @param {Object} props.question - Question object with content and answers
 * @param {number|null} props.selectedAnswerId - ID of the selected answer, if any
 * @param {Function} props.onSelectAnswer - Callback when an answer is selected
 * @param {Function} props.onSubmit - Callback when the answer is submitted
 * @param {boolean} props.showSubmit - Whether to show the submit button
 * @param {boolean} props.isSubmitting - Whether submission is in progress
 * @param {Object|null} props.feedback - Feedback object after submission
 * @returns {JSX.Element}
 */
const AnswerCard = ({ 
  question, 
  selectedAnswerId, 
  onSelectAnswer, 
  onSubmit,
  showSubmit = true,
  isSubmitting = false,
  feedback = null
}) => {
  // If no question is provided, don't render
  if (!question) return null;

  return (
    <div className="answer-card">
      <div className="question-content">
        <h2>{question.content}</h2>
      </div>
      
      <RadioGroup 
        options={question.answers.map(answer => ({
          id: answer.id,
          label: answer.text,
          value: answer.id.toString()
        }))}
        name={`question-${question.id}`}
        selectedValue={selectedAnswerId ? selectedAnswerId.toString() : ''}
        onChange={(value) => onSelectAnswer(question.id, parseInt(value))}
      />
      
      {feedback && (
        <div className={`answer-feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-content">
            <span className="feedback-icon">
              {feedback.isCorrect ? '✓' : '✗'}
            </span>
            <span className="feedback-message">
              {feedback.isCorrect ? 'Correct!' : 'Incorrect!'} 
              {feedback.explanation && <span className="feedback-explanation"> {feedback.explanation}</span>}
            </span>
          </div>
        </div>
      )}
      
      {showSubmit && !feedback && (
        <div className="submit-answer-container">
          <button 
            className="submit-answer-btn" 
            disabled={!selectedAnswerId || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AnswerCard; 