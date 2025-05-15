import { useAuth } from '../contexts/AuthContext';
import '../styles/CommonStyles.css';

/**
 * Teacher dashboard component
 */
const TeacherDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Teacher Dashboard</h1>
      
      <div className="dashboard-welcome">
        <h2>Welcome, {currentUser?.username}!</h2>
        <p>This is your teacher dashboard where you can manage quizzes and view student progress.</p>
      </div>
      
      <div className="dashboard-actions">
        <div className="dashboard-card">
          <h3>Manage Quizzes</h3>
          <p>Create, edit, and publish quizzes for your students.</p>
          <a href="/quizzes" className="dashboard-link">Go to Quizzes</a>
        </div>
        
        <div className="dashboard-card">
          <h3>Categories</h3>
          <p>Organize your quizzes by categories for easier management.</p>
          <a href="/categories" className="dashboard-link">Manage Categories</a>
        </div>
        
        <div className="dashboard-card">
          <h3>Student Progress</h3>
          <p>Review student performance and quiz results.</p>
          <a href="/results" className="dashboard-link">View Results</a>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
