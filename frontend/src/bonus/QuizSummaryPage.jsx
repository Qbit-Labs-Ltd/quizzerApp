import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import QuizListService from '../utils/QuizListService';
import QuizScoreService from './QuizScoreService';
import { questionApi } from '../utils/api';
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
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizAndScore = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch quiz, questions, and score in parallel
        const [quizData, questionsData, scoreData] = await Promise.all([
          QuizListService.getPublishedQuizById(id).catch(error => {
            console.error('Error fetching quiz:', error);
            throw new Error('Could not load quiz information. Please try again later.');
          }),
          questionApi.getByQuizId(id).catch(error => {
            console.error('Error fetching questions:', error);
            throw new Error('Could not load quiz questions. Please try again later.');
          }),
          QuizScoreService.getMyScore(id).catch(error => {
            console.error('Error fetching score:', error);
            throw new Error('Could not load your quiz score. Please try again later.');
          })
        ]);

        setQuiz(quizData);
        setQuestions(questionsData);
        setScore(scoreData);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        setError(error.message || 'Failed to load quiz summary. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndScore();
  }, [id]);

  // Helper function to get user's answer for a question
  const getUserAnswerForQuestion = (questionId) => {
    if (!score || !score.userAnswers) return null;
    return score.userAnswers.find(answer => answer.questionId === questionId)?.selectedAnswerId;
  };

  // Helper function to get the correct answer for a question
  const getCorrectAnswerForQuestion = (question) => {
    if (!question || !question.answers) return null;
    return question.answers.find(answer => answer.correct)?.id;
  };

  // Helper function to check if user's answer was correct
  const isAnswerCorrect = (question) => {
    const userAnswerId = getUserAnswerForQuestion(question.id);
    const correctAnswerId = getCorrectAnswerForQuestion(question);
    return userAnswerId === correctAnswerId;
  };

  // Helper function to get answer text by ID
  const getAnswerTextById = (question, answerId) => {
    if (!question || !question.answers) return "No answer";
    return question.answers.find(answer => answer.id === answerId)?.text || "Answer not found";
  };

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

        {/* Question breakdown section */}
        <div className="question-breakdown">
          <h3>Question Breakdown</h3>
          {questions.map((question, index) => {
            const userAnswerId = getUserAnswerForQuestion(question.id);
            const correctAnswerId = getCorrectAnswerForQuestion(question);
            const correct = isAnswerCorrect(question);

            return (
              <div
                key={question.id}
                className={`question-item ${correct ? 'correct' : 'wrong'}`}
              >
                <div className="question-header">
                  <span className="question-number">Question {index + 1}</span>
                  <span className={`question-status ${correct ? 'correct' : 'wrong'}`}>
                    {correct ? '✓ Correct' : '✗ Wrong'}
                  </span>
                </div>

                <div className="question-content">
                  <p>{question.content}</p>
                </div>

                <div className="question-answers">
                  <div className="user-answer">
                    <strong>Your answer:</strong>
                    <span className={correct ? 'correct-text' : 'wrong-text'}>
                      {userAnswerId
                        ? getAnswerTextById(question, userAnswerId)
                        : 'No answer provided'}
                    </span>
                  </div>

                  {!correct && (
                    <div className="correct-answer">
                      <strong>Correct answer:</strong>
                      <span className="correct-text">
                        {getAnswerTextById(question, correctAnswerId)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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