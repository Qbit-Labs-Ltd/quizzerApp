import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from '../utils/api';

// Create the context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token expired
          logout();
        } else {
          // Token still valid
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          setCurrentUser(storedUser);
          setToken(storedToken);
          // Set the authorization header for all requests
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        // Invalid token, clear it
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, username, role } = response.data;
      
      // Store in state
      const user = { username, role };
      setCurrentUser(user);
      setToken(token);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Authentication failed'
      };
    }
  };

  // Register function
  const register = async (username, email, password, role = 'STUDENT') => {
    try {
      const response = await api.post('/api/auth/register', { 
        username, 
        email, 
        password,
        roles: [role]
      });
      
      const { token, username: registeredUsername, role: registeredRole } = response.data;
      
      // Store in state
      const user = { username: registeredUsername, role: registeredRole };
      setCurrentUser(user);
      setToken(token);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Logout function
  const logout = () => {
    // Clear state
    setCurrentUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear auth header
    delete api.defaults.headers.common['Authorization'];
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  const isTeacher = () => hasRole('TEACHER');
  const isStudent = () => hasRole('STUDENT');
  
  // Check if user is authenticated
  const isAuthenticated = () => !!token;

  // Context value
  const value = {
    currentUser,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    isTeacher,
    isStudent
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
