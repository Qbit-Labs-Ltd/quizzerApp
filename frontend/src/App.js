import React from 'react';
import QuizQuestionList from './components/QuizQuestionList';
import AddQuestionForm from './views/AddQuestionForm';
import EditQuizForm from './views/EditQuizForm';

function App() {
  const mockQuiz = {
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
  };

  const existingQuiz = {
    title: 'Edit This Quiz',
  };

  return (
    <div className="App">
      <h1>🧪 Testing All Components</h1>

      <section style={{ borderBottom: '1px solid #ccc', marginBottom: 20 }}>
        <h2>AddQuestionForm</h2>
        <AddQuestionForm />
      </section>

      <section style={{ borderBottom: '1px solid #ccc', marginBottom: 20 }}>
        <h2>EditQuizForm</h2>
        <EditQuizForm existingQuiz={existingQuiz} />
      </section>

      <section>
        <h2>QuizQuestionList</h2>
        <QuizQuestionList quiz={mockQuiz} />
      </section>
    </div>
  );
}

export default App;
