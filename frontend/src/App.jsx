import React, { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes, useNavigate, useParams } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import CategoryCreator from './components/CategoryCreator';
import ConfirmationModal from './components/ConfirmationModal';
import EditQuestionView from './components/EditQuestionView';
import Modal from './components/Modal';
import QuizCreator from './components/QuizCreator';
import QuizForm from './components/QuizForm';
import QuizListWrapper from './components/QuizListWrapper';
import QuizQuestionsView from './components/QuizQuestionsView';
import ReviewForm from './components/ReviewForm';
import Toast from './components/Toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

// Views
import CategoryDetailPage from './views/CategoryDetailPage';
import CategoryListPage from './views/CategoryListPage';
import QuizListPage from './views/QuizListPage';
import QuizPage from './views/QuizPage';
import ResultsPage from './views/ResultsPage';
import TakeQuizPage from './views/TakeQuizPage';
const QuizReviewsPage = lazy(() => import('./views/QuizReviewsPage'));

// Bonus feature components
const QuizSummaryPage = lazy(() => import('./bonus').then(module => ({ default: module.QuizSummaryPage })));

// API utilities
import { quizApi, questionApi, answerApi } from './utils/api';

import './styles/CommonStyles.css';
import './styles/Quizzes.css';
import './styles/Review.css';
import './styles/Category.css';
import './styles/Feedback.css';
import './styles/Answer.css';
import './styles/Question.css';
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({ show: false, itemId: null, itemType: null });
  // State for quiz data
  const [quizzes, setQuizzes] = useState([]);
  // Loading and error states for quiz data fetching
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const queryClient = useQueryClient();

  const [showEditQuizModal, setShowEditQuizModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // Mutation for creating quizzes
  const createQuizMutation = useMutation({
    mutationFn: quizApi.create,
    onMutate: async (newQuizData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['quizzes'] });

      // Snapshot the previous value
      const previousQuizzes = queryClient.getQueryData(['quizzes']);

      // Optimistically update to the new value
      queryClient.setQueryData(['quizzes'], (old) => [...(old || []), { ...newQuizData, id: 'temp-' + Date.now() }]);

      return { previousQuizzes };
    },
    onError: (err, newQuizData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['quizzes'], context.previousQuizzes);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onSuccess: () => {
      showToast('Quiz created successfully!');
      setShowCreateQuizModal(false);
    }
  });

  // Mutation for updating quizzes
  const updateQuizMutation = useMutation({
    mutationFn: ({ id, quizData }) => quizApi.update(id, quizData),
    onMutate: async ({ id, quizData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['quizzes'] });
      await queryClient.cancelQueries({ queryKey: ['quiz', id] });

      // Snapshot the previous value
      const previousQuizzes = queryClient.getQueryData(['quizzes']);
      const previousQuiz = queryClient.getQueryData(['quiz', id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['quizzes'], (old) =>
        old.map(quiz => quiz.id === id ? { ...quiz, ...quizData } : quiz)
      );
      queryClient.setQueryData(['quiz', id], (old) => ({
        ...old,
        ...quizData
      }));

      return { previousQuizzes, previousQuiz };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousQuizzes) {
        queryClient.setQueryData(['quizzes'], context.previousQuizzes);
      }
      if (context?.previousQuiz) {
        queryClient.setQueryData(['quiz', variables.id], context.previousQuiz);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.id] });
    },
    onSuccess: (data, variables) => {
      // Update the cache with the server response
      queryClient.setQueryData(['quiz', variables.id], data);
      queryClient.setQueryData(['quizzes'], (old) =>
        old.map(quiz => quiz.id === variables.id ? data : quiz)
      );
      showToast('Quiz updated successfully!', 'success');
    }
  });

  // Mutation for deleting quizzes
  const deleteQuizMutation = useMutation({
    mutationFn: (id) => quizApi.delete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['quizzes'] });

      // Snapshot the previous value
      const previousQuizzes = queryClient.getQueryData(['quizzes']);

      // Optimistically update to the new value
      queryClient.setQueryData(['quizzes'], (old) =>
        old.filter(quiz => quiz.id !== id)
      );

      return { previousQuizzes };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['quizzes'], context.previousQuizzes);
      showToast(`Failed to delete quiz`, 'error');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onSuccess: () => {
      showToast('Quiz deleted successfully');
    }
  });

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
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });

    // Auto-hide the toast after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  /**
   * Closes the currently displayed toast notification
   */
  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
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
        deleteQuizMutation.mutate(itemId);
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
      const existingQuizzes = queryClient.getQueryData(['quizzes']) || [];
      const existingQuiz = existingQuizzes.find(q =>
        q.name === quizData.name &&
        q.courseCode === quizData.courseCode &&
        quizData.name.trim() !== '' &&
        quizData.courseCode.trim() !== ''
      );

      if (existingQuiz) {
        showToast('A quiz with this name and course code already exists', 'error');
        throw new Error('Duplicate quiz name and course code');
      }

      const result = await createQuizMutation.mutateAsync(quizData);
      return result;
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
      const result = await updateQuizMutation.mutateAsync({ id, quizData });
      return result;
    } catch (error) {
      console.error('Error updating quiz:', error);
      showToast(`Failed to update quiz: ${error.message}`, 'error');
      throw error;
    }
  };

  return (
    <Router>
      <div className="app">
        <nav className="app-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/quizzes">Manage Quizzes</Link></li>
            <li><Link to="/quizzes/published">Available Quizzes</Link></li>
            <li><Link to="/categories">Categories</Link></li>
          </ul>
        </nav>

        <main className="app-content">
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error-message">{error}</div>}

          <Routes>
            <Route path="/" element={<QuizListPage />} />
            <Route
              path="/quizzes"
              element={
                <div>
                  <div className="page-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="page-title">Quizzes</h1>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowCreateQuizModal(true)}
                    >
                      Create Quiz
                    </button>
                  </div>
                  <Modal
                    isOpen={showCreateQuizModal}
                    onClose={() => setShowCreateQuizModal(false)}
                    title="Create New Quiz"
                  >
                    <QuizCreator
                      handleCreateQuiz={async (quizData) => {
                        await handleCreateQuiz(quizData);
                        setShowCreateQuizModal(false);
                      }}
                      showToast={showToast}
                      onCancel={() => setShowCreateQuizModal(false)}
                    />                  </Modal>
                  <QuizListWrapper
                    onDelete={(id) => showDeleteConfirmation(id, 'quiz')}
                    showToast={showToast}
                  />
                </div>
              }
            />
            <Route
              path="/quizzes/published"
              element={<QuizListPage />}
            />
            <Route
              path="/categories"
              element={<CategoryListPage />}
            />            {/* Edit quiz is handled through modal now, so this route is removed */}
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
            {/* New routes for categories */}
            <Route path="/categories/new" element={<CategoryCreator showToast={showToast} />} />
            <Route
              path="/quizzes/:id/take"
              element={<TakeQuizPage />}
            />
            <Route
              path="/quiz/:id"
              element={<QuizPage />}
            />
            <Route
              path="/quiz/:id/results"
              element={<ResultsPage />}
            />            <Route
              path="/quiz/:id/reviews"
              element={
                <Suspense fallback={<div>Loading reviews page…</div>}>
                  <QuizReviewsPage />
                </Suspense>
              }
            />
            <Route
              path="/quiz/:id/summary"
              element={
                <Suspense fallback={<div>Loading summary page...</div>}>
                  <QuizSummaryPage />
                </Suspense>
              }
            />
            <Route
              path="/categories/:id"
              element={<CategoryDetailPage />}
            />
            {/* Review routes */}
            <Route
              path="/quiz/:id/review"
              element={<ReviewForm />}
            />
            {/* New route for editing reviews */}
            <Route
              path="/reviews/:id/edit"
              element={<ReviewEditRedirect />}
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
  const queryClient = useQueryClient();

  // Use React Query to fetch quiz data
  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizApi.getById(id),
    onError: (err) => {
      console.error("Error fetching quiz:", err);
      showToast('Failed to load quiz', 'error');
      navigate('/quizzes');
    }
  });

  /**
   * Handles quiz update submission
   * @param {Object} quizData - The updated quiz data
   */
  const handleUpdate = async (quizData) => {
    try {
      const updatedQuiz = await handleUpdateQuiz(id, quizData);
      // Update the cache with the server response
      queryClient.setQueryData(['quiz', id], updatedQuiz); queryClient.setQueryData(['quizzes'], (old) =>
        old.map(quiz => quiz.id === id ? updatedQuiz : quiz)
      );
      showToast('Quiz updated successfully!');
      // No navigation - we stay on the current page
    } catch (err) {
      console.error("Error updating quiz:", err);
      showToast('Failed to update quiz', 'error');
    }
  };
  /**
   * Handles cancellation of quiz editing
   */
  const handleCancel = () => {
    // No navigation - we stay on the current page
  };

  if (isLoading) return <div className="loading">Loading quiz...</div>;
  if (!quiz) return <div className="error-message">Quiz not found</div>;

  return (
    <div>
      <h1 className="page-title">Edit Quiz</h1>
      <QuizForm
        initialData={{
          id: quiz.id,
          name: quiz.name,
          description: quiz.description,
          courseCode: quiz.courseCode,
          published: quiz.published,
          category: quiz.categoryId || ''
        }}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
      />
    </div>
  );
}

/**
 * Component that redirects from /reviews/:id/edit to the ReviewForm with the appropriate params
 * Used to maintain compatibility with our existing ReviewForm implementation
 */
function ReviewEditRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviewInfo = async () => {
      try {
        // In a real implementation, we would fetch the review here to get its quizId
        // For now, we'll use a placeholder quizId from localStorage or redirect to a fallback

        // Mock implementation using localStorage (for demo purposes)
        let quizId = localStorage.getItem(`review_${id}_quizId`);

        if (!quizId) {
          // If we don't have the quizId stored, we can:
          // 1. Fetch it from the API (ideal case)
          // 2. Redirect to a fallback route (e.g., homepage)
          console.warn('QuizId not found for review, redirecting to homepage');
          navigate('/');
          return;
        }

        // Redirect to our existing ReviewForm with the correct query param
        navigate(`/quiz/${quizId}/review?reviewId=${id}`);
      } catch (error) {
        console.error('Error in review edit redirect:', error);
        navigate('/');
      }
    };

    fetchReviewInfo();
  }, [id, navigate]);

  return <div className="loading">Redirecting...</div>;
}

export default App;