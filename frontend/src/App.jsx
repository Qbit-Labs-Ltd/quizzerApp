import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import QuizForm from './components/QuizForm';
import QuizList from './components/QuizList';
import Toast from './components/Toast';
import ConfirmationModal from './components/ConfirmationModal';
import QuizCreator from './components/QuizCreator';
import QuizQuestionsView from './components/QuizQuestionsView';
import EditQuestionView from './components/EditQuestionView';
import { quizApi, questionApi, answerApi } from './utils/api';
import './styles/CommonStyles.css';

/**
 * Main application component that handles routing and global state
 * Manages application-wide concerns such as:
 * - Toast notifications
 * - Confirmation modals for deletions
 * - Quiz data fetching
 * - CRUD operations for quizzes, questions and answers
 */
function App() {
  // State for toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({ show: false, itemId: null, itemType: null });
  // State for quiz data
  const [quizzes, setQuizzes] = useState([]);
  // Loading and error states for quiz data fetching
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch quizzes when component mounts
   */
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

  /**
   * Shows a toast notification with the specified message and type
   * @param {string} message - The message to display in the toast
   * @param {string} type - The type of toast (success, error, warning)
   */
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  /**
   * Closes the currently displayed toast notification
   */
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  /**
   * Shows the delete confirmation modal for the specified item
   * @param {number} itemId - The ID of the item to be deleted
   * @param {string} itemType - The type of item (quiz, question, answer)
   */
  const showDeleteConfirmation = (itemId, itemType) => {
    setDeleteModal({ show: true, itemId, itemType });
  };

  /**
   * Closes the delete confirmation modal without performing the deletion
   */
  const cancelDelete = () => {
    setDeleteModal({ show: false, itemId: null, itemType: null });
  };

  /**
   * Confirms and performs the deletion of the item currently set in the delete modal
   */
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

  /**
   * Creates a new quiz with the provided data
   * @param {Object} quizData - The data for the new quiz
   * @returns {Promise<Object>} The newly created quiz
   */
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

  /**
   * Updates an existing quiz with the provided data
   * @param {number} id - The ID of the quiz to update
   * @param {Object} quizData - The updated quiz data
   * @returns {Promise<Object>} The updated quiz
   */
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
            <li><Link to="/categories/new" ></Link>Create Category</li>
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

/**
 * Wrapper component for QuizList that provides navigation capabilities
 * Ensures navigation functions are available to the QuizList component
 * @param {Object} props - Component props
 * @returns {JSX.Element}
 */
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

/**
 * Component for editing an existing quiz
 * Handles fetching quiz data, updating, and navigation
 * @param {Object} props - Component props
 * @param {Function} props.showToast - Function to show toast notifications
 * @param {Function} props.handleUpdateQuiz - Function to handle quiz updates
 * @returns {JSX.Element}
 */
function EditQuizView({ showToast, handleUpdateQuiz }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch quiz data when component mounts
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

  /**
   * Handles quiz update submission
   * @param {Object} quizData - The updated quiz data
   */
  const handleUpdate = async (quizData) => {
    try {
      await handleUpdateQuiz(id, quizData);
      navigate('/quizzes');
    } catch (err) {
      console.error("Error updating quiz:", err);
    }
  };

  /**
   * Handles cancellation of quiz editing
   */
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