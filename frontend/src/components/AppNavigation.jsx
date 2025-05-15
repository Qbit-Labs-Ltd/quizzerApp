import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/CommonStyles.css';

/**
 * Application navigation bar with conditional rendering based on authentication status
 */
const AppNavigation = () => {
  const { currentUser, isAuthenticated, logout, isTeacher, isStudent } = useAuth();

  return (
    <ul className="nav-links">
      {!isAuthenticated() ? (
        // Links for unauthenticated users
        <>
          <li className="nav-item">
            <Link to="/login" className="nav-link">Login</Link>
          </li>
          <li className="nav-item">
            <Link to="/register" className="nav-link">Register</Link>
          </li>
        </>
      ) : (
        // Links for authenticated users
        <>
          {isTeacher() && (
            // Teacher-specific links
            <>
              <li className="nav-item">
                <Link to="/teacher" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/quizzes" className="nav-link">Manage Quizzes</Link>
              </li>
              <li className="nav-item">
                <Link to="/categories" className="nav-link">Categories</Link>
              </li>
            </>
          )}
          
          {isStudent() && (
            // Student-specific links
            <>
              <li className="nav-item">
                <Link to="/student" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/quizzes/published" className="nav-link">Available Quizzes</Link>
              </li>
            </>
          )}
          
          {/* User info and logout button */}
          <li className="nav-item user-info">
            <span className="username">
              Welcome, {currentUser?.username} ({currentUser?.role})
            </span>
          </li>
          <li className="nav-item">
            <button className="nav-link logout-btn" onClick={logout}>
              Logout
            </button>
          </li>
        </>
      )}
    </ul>
  );
};

export default AppNavigation;
