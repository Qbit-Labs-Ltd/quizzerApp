import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AnswerCard from '../components/AnswerCard';
import FeedbackToast from '../components/FeedbackToast';
import AnswerService from '../utils/AnswerService';
import QuizListService from '../utils/QuizListService';
import '../styles/CommonStyles.css';
import '../styles/Quizzes.css';
import '../styles/Answer.css';
import '../styles/Feedback.css';

/**
 * Component for taking a quiz
 * @returns {JSX.Element}
 */
const TakeQuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState({ visible: false, isCorrect: false, message: '' });
  const [currentQuestionFeedback, setCurrentQuestionFeedback] = useState(null);

  const answerService = new AnswerService();

  // Fetch quiz and questions when component mounts
  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Create a new instance of the answer service
        const answerServiceInstance = new AnswerService();

        // Fetch quiz and questions in parallel
        const [quizData, questionsData] = await Promise.all([
          QuizListService.getPublishedQuizById(id).catch(error => {
            console.error('Error fetching quiz:', error);
            throw new Error('Could not load quiz information. Please try again later.');
          }),
          answerServiceInstance.getQuestionsForQuiz(id).catch(error => {
            console.error('Error fetching questions:', error);
            throw new Error('Could not load quiz questions. Please try again later.');
          })
        ]);

        // Make sure we have both quiz data and questions before proceeding
        if (!quizData || !questionsData || questionsData.length === 0) {
          throw new Error('This quiz has no questions or is not available right now.');
        }

        setQuiz(quizData);
        setQuestions(questionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz or questions:', error);
        setError(error.message || 'Failed to load quiz. Please try again later.');
        setLoading(false);

        // You could also add a retry mechanism here
      }
    };

    fetchQuizAndQuestions();
  }, [id]);

  // Reset feedback when changing questions
  useEffect(() => {
    setCurrentQuestionFeedback(null);
  }, [currentQuestion]);

  /**
   * Handle selecting an answer for the current question
   * @param {number} questionId - ID of the question
   * @param {number} answerId - ID of the selected answer
   */
  const handleSelectAnswer = (questionId, answerId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  /**
   * Submit a single answer and show feedback
   */
  const handleSubmitAnswer = async () => {
    const questionId = questions[currentQuestion].id;
    const answerId = selectedAnswers[questionId];

    if (!answerId) return;

    try {
      setSubmitting(true);

      // Format the answer for submission
      const answer = {
        questionId: Number(questionId),
        selectedAnswerId: Number(answerId)
      };

      // Simulate getting feedback for a single answer
      const question = questions[currentQuestion];
      const correctAnswerId = question.answers.find(a => a.correct)?.id;
      const isCorrect = answerId === correctAnswerId;

      const feedback = {
        questionId,
        isCorrect,
        correctAnswerId,
        explanation: isCorrect ? 'Great job!' : 'The selected answer is incorrect.'
      };

      // Show feedback toast
      setFeedbackToast({
        visible: true,
        isCorrect,
        message: isCorrect ? 'Correct!' : 'Try again'
      });

      // Set feedback for the current question
      setCurrentQuestionFeedback(feedback);

      // Automatically go to next question after delay if answer is correct
      if (isCorrect && currentQuestion < questions.length - 1) {
        setTimeout(() => {
          handleNextQuestion();
        }, 2000);
      }

    } catch (err) {
      console.error("Error submitting answer:", err);
      setFeedbackToast({
        visible: true,
        isCorrect: false,
        message: 'Error submitting answer'
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Move to the next question
   */
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Reset feedback for the next question
      setCurrentQuestionFeedback(null);
    }
  };

  /**
   * Move to the previous question
   */
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Reset feedback for the previous question
      setCurrentQuestionFeedback(null);
    }
  };
  /**
   * Submit the quiz answers
   */
  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);

      // Format the answers for submission
      const answers = Object.entries(selectedAnswers).map(([questionId, selectedAnswerId]) => ({
        questionId: Number(questionId),
        selectedAnswerId: Number(selectedAnswerId)
      }));

      // Store user answers in session storage for the summary page
      const userAnswersKey = `quiz_${id}_answers`;
      sessionStorage.setItem(userAnswersKey, JSON.stringify(answers));

      // Submit the answers
      const quizResults = await answerService.submitAnswers(id, answers);

      // Update state with results
      setResults(quizResults);
      setQuizCompleted(true);

      // Navigate to the summary page - New bonus feature
      navigate(`/quiz/${id}/summary`);

    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError('Failed to submit quiz answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Reset the quiz to start over
   */
  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setQuizCompleted(false);
    setResults(null);
    setCurrentQuestionFeedback(null);
  };

  /**
   * Navigate back to the quizzes list
   */
  const handleBackToQuizzes = () => {
    navigate('/quizzes/published');
  };

  /**
   * Close the feedback toast
   */
  const handleCloseToast = () => {
    setFeedbackToast({ ...feedbackToast, visible: false });
  };

  // Loading state
  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">Loading quiz...</div>
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

  // Empty state - no quiz or questions
  if (!quiz || !questions || questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="empty-state">
          <h2>No questions available</h2>
          <p>This quiz doesn't have any questions yet.</p>
          <button onClick={handleBackToQuizzes} className="back-button">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Results view - after quiz completion
  if (quizCompleted && results) {
    return (
      <div className="quiz-container">
        <div className="quiz-results">
          <h1 className="page-title">Quiz Results</h1>

          <div className="result-summary">
            <h2>{quiz.name}</h2>
            <div className="score-display">
              <div className="score-number">{results.score}%</div>
              <p>You got {results.correctAnswers} out of {results.totalQuestions} questions correct</p>
            </div>
          </div>

          <div className="questions-review">
            <h3>Review Your Answers</h3>
            {results.questionResults.map((result, index) => {
              const question = questions.find(q => q.id === result.questionId);
              const selectedAnswer = question?.answers.find(a => a.id === selectedAnswers[question.id]);
              const correctAnswer = question?.answers.find(a => a.id === result.correctAnswerId);

              return (
                <div
                  key={result.questionId}
                  className={`review-question ${result.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="question-index">Question {index + 1}</div>
                  <div className="question-content">{question?.content}</div>

                  <div className="answer-review">
                    <div className="your-answer">
                      <strong>Your answer:</strong> {selectedAnswer?.text || 'No answer selected'}
                    </div>

                    {!result.isCorrect && (
                      <div className="correct-answer">
                        <strong>Correct answer:</strong> {correctAnswer?.text || 'Unknown'}
                      </div>
                    )}

                    <div className="answer-feedback">
                      {result.explanation || (result.isCorrect ? 'Correct!' : 'Incorrect')}
                    </div>
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
  }

  // Quiz taking view
  const currentQuestionData = questions[currentQuestion];
  const hasSelectedAnswer = selectedAnswers[currentQuestionData.id] !== undefined;
  const allQuestionsAnswered = questions.every(q => selectedAnswers[q.id] !== undefined);
  const hasSubmittedCurrentAnswer = currentQuestionFeedback !== null;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="page-title">{quiz.name}</h1>
        <div className="quiz-meta">
          <div className="quiz-course">Course: {quiz.courseCode}</div>
          <div className="quiz-progress">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
      </div>

      <div className="question-progress-bar">
        <div
          className="progress-indicator"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <AnswerCard
        question={currentQuestionData}
        selectedAnswerId={selectedAnswers[currentQuestionData.id]}
        onSelectAnswer={handleSelectAnswer}
        onSubmit={handleSubmitAnswer}
        showSubmit={!hasSubmittedCurrentAnswer}
        isSubmitting={submitting}
        feedback={currentQuestionFeedback}
      />

      <div className="quiz-navigation">
        <div className="navigation-buttons">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="prev-button"
          >
            Previous
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              disabled={!hasSelectedAnswer}
              className="next-button"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered || submitting}
              className="submit-quiz-button"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>

        <div className="questions-indicator">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className={`question-indicator ${selectedAnswers[q.id] !== undefined ? 'answered' : ''} ${index === currentQuestion ? 'current' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <FeedbackToast
        visible={feedbackToast.visible}
        isCorrect={feedbackToast.isCorrect}
        message={feedbackToast.message}
        onClose={handleCloseToast}
        autoCloseTime={3000}
      />
    </div>
  );
};

export default TakeQuizPage;