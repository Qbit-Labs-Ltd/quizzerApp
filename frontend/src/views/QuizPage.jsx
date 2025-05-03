import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QuestionBlock from '../components/QuestionBlock';
import { quizApi, questionApi } from '../utils/api';
import '../styles/CommonStyles.css';

/**
 * Student-facing page that shows a quiz with all its questions.
 * URL: /quiz/:id
 */
export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizRes, questionRes] = await Promise.all([
          quizApi.getById(id),
          questionApi.getByQuizId(id)
        ]);
        setQuiz(quizRes);
        setQuestions(questionRes);
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading" role="status" aria-live="polite">Loading quiz…</div>;
  if (error) return <div className="error-message" role="alert">{error}</div>;
  if (!quiz) return <div className="error-message" role="alert">Quiz not found</div>;

  return (
    <div className="quiz-page" aria-labelledby="quiz-title">
      <h1 id="quiz-title" className="quiz-title">{quiz.name}</h1>
      {quiz.description && <p className="quiz-description">{quiz.description}</p>}

      {questions.length === 0 ? (
        <p>No questions in this quiz yet.</p>
      ) : (
        questions.map(q => (
          <QuestionBlock key={q.id} question={q} />
        ))
      )}
    </div>
  );
}
