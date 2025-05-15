import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import QuizListService from '../utils/QuizListService';
import QuizScoreService from './QuizScoreService';
import './bonusStyles.css';

/**
 * Component for displaying the personal quiz summary after completion
 * Shows the number of correct and wrong answers
 * @returns {JSX.Element}
 */
const QuizSummaryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizAndScore = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch quiz and score in parallel
        const [quizData, scoreData] = await Promise.all([
          QuizListService.getPublishedQuizById(id).catch(error => {
            console.error('Error fetching quiz:', error);
            throw new Error('Could not load quiz information. Please try again later.');
          }),
          QuizScoreService.getMyScore(id).catch(error => {
            console.error('Error fetching score:', error);
            throw new Error('Could not load your quiz score. Please try again later.');
          })
        ]);

        setQuiz(quizData);
        setScore(scoreData);
      } catch (error) {
        console.error('Error fetching quiz or score:', error);
        setError(error.message || 'Failed to load quiz summary. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndScore();
  }, [id]);

  const handleBackToQuizzes = () => {
    navigate('/quizzes/published');
  };

  const handleRetakeQuiz = () => {
    navigate(`/quizzes/${id}/take`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">Loading quiz summary...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-message">{error}</div>
        <button onClick={handleBackToQuizzes} className="back-button">
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Empty state - no quiz or score
  if (!quiz || !score) {
    return (
      <div className="quiz-container">
        <div className="empty-state">
          <h2>No summary available</h2>
          <p>We couldn't find a summary for this quiz.</p>
          <button onClick={handleBackToQuizzes} className="back-button">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-results">
        <h1 className="page-title">Quiz Summary</h1>

        <div className="note-banner info-banner">
          <p>This is a mock summary showing your perfect score. In a real environment, this would display your actual submitted answers.</p>
        </div>

        <div className="result-summary">
          <h2>{quiz.name}</h2>
          <p className="course-code">Course: {quiz.courseCode}</p>
          
          <div className="score-display">
            <div className="score-number">{score.percentage}%</div>
            <p>You got {score.correctCount} out of {score.totalQuestions} questions correct</p>
            
            <div className="score-breakdown">
              <div className="score-item score-correct">
                <span className="score-label">Correct:</span>
                <span className="score-value">{score.correctCount}</span>
              </div>
              <div className="score-item score-wrong">
                <span className="score-label">Wrong:</span>
                <span className="score-value">{score.wrongCount}</span>
              </div>
              <div className="score-item score-total">
                <span className="score-label">Total:</span>
                <span className="score-value">{score.totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button onClick={handleRetakeQuiz} className="retake-button">
            Retake Quiz
          </button>
          <button onClick={handleBackToQuizzes} className="back-button">
            Back to Quizzes
          </button>
        </div>

        {/* Write Review Button */}
        <div className="quiz-page-footer">
          <Link
            to={`/quiz/${id}/review`}
            className="btn btn-primary write-review-btn"
            aria-label="Write a review for this quiz"
          >
            Write a Review
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizSummaryPage; 