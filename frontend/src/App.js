import React, { useState } from 'react';
import QuizQuestionList from './components/QuizQuestionList';
import AddQuestionForm from './views/AddQuestionForm';
import EditQuizForm from './views/EditQuizForm';

function App() {
  // Shared state for the quiz and questions
  const [quiz, setQuiz] = useState({
    title: 'Sample Quiz',
    questions: [
      {
        text: 'What is 2 + 2?',
        answers: ['3', '4', '5'],
      },
      {
        text: 'Capital of Finland?',
        answers: ['Helsinki', 'Oslo', 'Stockholm'],
      },
    ],
  });

  return (
    <div
      className="App"
      style={{
        fontFamily: 'sans-serif',
        maxWidth: '700px',
        margin: '0 auto',
        padding: '2rem',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>🧪 Quiz Manager</h1>

      <section
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#fafafa',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Add Question</h2>
        <AddQuestionForm quiz={quiz} setQuiz={setQuiz} />
      </section>

      <section
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#fafafa',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Edit Quiz</h2>
        <EditQuizForm quiz={quiz} setQuiz={setQuiz} />
      </section>

      <section
        style={{
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#fafafa',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>All Questions</h2>
        <QuizQuestionList quiz={quiz} />
      </section>
    </div>
  );
}

export default App;
