import { useAuth } from '../contexts/AuthContext';
import '../styles/CommonStyles.css';

/**
 * Student dashboard component
 */
const StudentDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Student Dashboard</h1>
      
      <div className="dashboard-welcome">
        <h2>Welcome, {currentUser?.username}!</h2>
        <p>This is your student dashboard where you can take quizzes and track your progress.</p>
      </div>
      
      <div className="dashboard-actions">
        <div className="dashboard-card">
          <h3>Available Quizzes</h3>
          <p>Browse and take quizzes that have been published by teachers.</p>
          <a href="/quizzes/published" className="dashboard-link">Take Quizzes</a>
        </div>
        
        <div className="dashboard-card">
          <h3>My Results</h3>
          <p>Review your quiz attempts and performance over time.</p>
          <a href="/my-results" className="dashboard-link">View My Results</a>
        </div>
        
        <div className="dashboard-card">
          <h3>My Reviews</h3>
          <p>See your reviews for completed quizzes.</p>
          <a href="/my-reviews" className="dashboard-link">View My Reviews</a>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
