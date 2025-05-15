import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppNavigation from './components/AppNavigation';

// Dashboard views
import TeacherDashboard from './views/TeacherDashboard';
import StudentDashboard from './views/StudentDashboard';

// Import other views (from original App.jsx)
import QuizListPage from './views/QuizListPage';
import CategoryListPage from './views/CategoryListPage';
import CategoryDetailPage from './views/CategoryDetailPage';
import QuizPage from './views/QuizPage';
import TakeQuizPage from './views/TakeQuizPage';
import ResultsPage from './views/ResultsPage';
import { Suspense, lazy } from 'react';

// CSS
import './styles/CommonStyles.css';

const QuizReviewsPage = lazy(() => import('./views/QuizReviewsPage'));

/**
 * Sample App with JWT authentication showing how to use:
 * - AuthProvider
 * - Protected routes
 * - Role-based access
 * - JWT token handling
 */
function AuthenticatedApp() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <nav className="app-nav">
            <div className="brand">
              <h1>QuizzerApp</h1>
            </div>
            <AppNavigation />
          </nav>

          <main className="app-content">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Root redirects to login or role-specific page based on auth */}
              <Route path="/" element={<Navigate to="/login" />} />
              
              {/* Teacher protected routes */}
              <Route element={<ProtectedRoute requiredRole="TEACHER" />}>
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/quizzes" element={<QuizListPage />} />
                <Route path="/categories" element={<CategoryListPage />} />
                <Route path="/categories/:id" element={<CategoryDetailPage />} />
              </Route>
              
              {/* Student protected routes */}
              <Route element={<ProtectedRoute requiredRole="STUDENT" />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/quizzes/published" element={<QuizListPage />} />
              </Route>
              
              {/* Authenticated routes (any role) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/quiz/:id" element={<QuizPage />} />
                <Route path="/quiz/:id/take" element={<TakeQuizPage />} />
                <Route path="/quiz/:id/results" element={<ResultsPage />} />
                <Route
                  path="/quiz/:id/reviews"
                  element={
                    <Suspense fallback={<div>Loading reviews...</div>}>
                      <QuizReviewsPage />
                    </Suspense>
                  }
                />
              </Route>
              
              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </main>
          
          {/* Footer could go here */}
          <footer className="app-footer">
            <p>© 2025 QuizzerApp - Secure JWT Authentication Demo</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default AuthenticatedApp;
