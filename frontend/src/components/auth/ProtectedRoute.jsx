import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected route component that requires authentication and optionally a specific role
 * @param {Object} props Component props
 * @param {string} [props.requiredRole] Role required to access the route (optional)
 * @returns {JSX.Element} Component rendering
 */
const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, currentUser, hasRole } = useAuth();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // If role is required and user doesn't have it, redirect to appropriate page
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect based on user's role
    const redirectPath = currentUser?.role === 'TEACHER' ? '/teacher' : '/student';
    return <Navigate to={redirectPath} />;
  }
  
  // User is authenticated and has the required role (if any)
  return <Outlet />;
};

export default ProtectedRoute;
