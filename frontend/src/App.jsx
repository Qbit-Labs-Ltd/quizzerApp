import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import QuizForm from './components/QuizForm';
import QuizList from './components/QuizList';
import Toast from './components/Toast';
import ConfirmationModal from './components/ConfirmationModal';
import QuizCreator from './components/QuizCreator';
import QuizQuestionsView from './components/QuizQuestionsView';
import EditQuestionView from './components/EditQuestionView';
import { quizApi, questionApi, answerApi } from './utils/api';
import './styles/CommonStyles.css';

function App() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ show: false, itemId: null, itemType: null });
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch quizzes when component mounts
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await quizApi.getAll();
        setQuizzes(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch quizzes');
        showToast('Failed to load quizzes', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  const showDeleteConfirmation = (itemId, itemType) => {
    setDeleteModal({ show: true, itemId, itemType });
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, itemId: null, itemType: null });
  };

  const confirmDelete = async () => {
    const { itemId, itemType } = deleteModal;

    try {
      if (itemType === 'quiz') {
        await quizApi.delete(itemId);
        setQuizzes(quizzes.filter(quiz => quiz.id !== itemId));
        showToast('Quiz deleted successfully');
      } else if (itemType === 'question') {
        await questionApi.delete(itemId);
        showToast('Question deleted successfully');
      } else if (itemType === 'answer') {
        await answerApi.delete(itemId);
        showToast('Answer option deleted successfully');
      }
    } catch (err) {
      showToast(`Failed to delete ${itemType}`, 'error');
    }

    cancelDelete();
  };

  const handleCreateQuiz = async (quizData) => {
    try {
      // Check if a quiz with the same name AND course code already exists
      const existingQuiz = quizzes.find(q =>
        q.name === quizData.name &&
        q.courseCode === quizData.courseCode &&
        quizData.name.trim() !== '' &&
        quizData.courseCode.trim() !== '' // Only check if both fields aren't empty
      );

      if (existingQuiz) {
        showToast('A quiz with this name and course code already exists', 'error');
        throw new Error('Duplicate quiz name and course code');
      }

      console.log('Creating new quiz:', quizData);

      // Create the quiz with the API
      const newQuiz = await quizApi.create(quizData);

      // Update state using a callback to ensure we have the latest state
      setQuizzes(prevQuizzes => {
        // Check if this quiz already exists in the list (double submit protection)
        const exists = prevQuizzes.some(q => q.id === newQuiz.id);
        if (exists) {
          console.log('Quiz already exists in state, not adding duplicate');
          return prevQuizzes;
        }
        return [...prevQuizzes, newQuiz];
      });

      showToast('Quiz created successfully!');
      return newQuiz;
    } catch (err) {
      if (!err.message?.includes('Duplicate quiz name and course code')) {
        showToast('Failed to create quiz', 'error');
      }
      throw err;
    }
  };

  const handleUpdateQuiz = async (id, quizData) => {
    try {
      const updatedQuiz = await quizApi.update(id, quizData);
      setQuizzes(quizzes.map(quiz => quiz.id === id ? updatedQuiz : quiz));
      showToast('Quiz updated successfully!');
      return updatedQuiz;
    } catch (err) {
      showToast('Failed to update quiz', 'error');
      throw err;
    }
  };

  return (
    <Router>
      <div className="app">
        <nav className="app-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/quizzes">Quizzes</Link></li>
            <li><Link to="/quizzes/new">Create Quiz</Link></li>
          </ul>
        </nav>

        <main className="app-content">
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error-message">{error}</div>}

          <Routes>
            <Route path="/" element={<div>Welcome to Quiz App</div>} />
            <Route
              path="/quizzes"
              element={<QuizListWrapper
                quizzes={quizzes}
                onDelete={(id) => showDeleteConfirmation(id, 'quiz')}
                loading={loading}
              />}
            />
            <Route
              path="/quizzes/new"
              element={<QuizCreator
                handleCreateQuiz={handleCreateQuiz}
                showToast={showToast}
              />}
            />
            <Route
              path="/quizzes/:id/edit"
              element={<EditQuizView
                showToast={showToast}
                handleUpdateQuiz={handleUpdateQuiz}
              />}
            />
            <Route
              path="/quizzes/:id/questions"
              element={<QuizQuestionsView
                showToast={showToast}
                showDeleteConfirmation={showDeleteConfirmation}
              />}
            />
            <Route
              path="/questions/:id/edit"
              element={<EditQuestionView showToast={showToast} />}
            />
          </Routes>
        </main>

        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}

        <ConfirmationModal
          isOpen={deleteModal.show}
          title={`Delete ${deleteModal.itemType || 'Item'}`}
          message={`Are you sure you want to delete this ${deleteModal.itemType || 'item'}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </div>
    </Router>
  );
}

// Add this wrapper component to fix navigation
function QuizListWrapper(props) {
  const navigate = useNavigate();
  return (
    <QuizList
      {...props}
      onEdit={(id) => navigate(`/quizzes/${id}/edit`)}
      onViewQuestions={(id) => navigate(`/quizzes/${id}/questions`)}
    />
  );
}

// Separated EditQuizView component, still in App.jsx for now
function EditQuizView({ showToast, handleUpdateQuiz }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await quizApi.getById(id);
        setQuiz(data);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        showToast('Failed to load quiz', 'error');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate, showToast]);

  const handleUpdate = async (quizData) => {
    try {
      await handleUpdateQuiz(id, quizData);
      navigate('/quizzes');
    } catch (err) {
      console.error("Error updating quiz:", err);
    }
  };

  const handleCancel = () => {
    navigate('/quizzes');
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (!quiz) return <div className="error-message">Quiz not found</div>;

  return (
    <div>
      <h1 className="page-title">Edit Quiz</h1>
      <QuizForm
        initialData={quiz}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default App;