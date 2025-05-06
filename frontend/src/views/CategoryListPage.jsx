import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CommonStyles.css';
import CategoryListService from '../utils/CategoryListService';

/**
 * Component that displays a list of categories with their quizzes
 * 
 * @returns {JSX.Element}
 */
const CategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categoryQuizzes, setCategoryQuizzes] = useState({});
  const [loadingQuizzes, setLoadingQuizzes] = useState({});
  const [useMockData, setUseMockData] = useState(false);
  const navigate = useNavigate();

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await CategoryListService.getAllCategories();
        setCategories(data);
        setError(null);
        console.log("Categories loaded successfully:", data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError('Failed to load categories. Please check your connection and try again.');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /**
   * Toggle expansion of a category and load its quizzes
   * @param {number} categoryId - ID of the category to expand/collapse
   */
  const toggleCategory = async (categoryId) => {
    if (expandedCategory === categoryId) {
      // Collapse the category if it's already expanded
      setExpandedCategory(null);
    } else {
      // Expand the category and load its quizzes if not already loaded
      setExpandedCategory(categoryId);

      if (!categoryQuizzes[categoryId]) {
        setLoadingQuizzes(prev => ({ ...prev, [categoryId]: true }));

        try {
          const quizzes = await CategoryListService.getQuizzesByCategory(categoryId);
          setCategoryQuizzes(prev => ({ ...prev, [categoryId]: quizzes }));
        } catch (err) {
          console.error(`Error loading quizzes for category ${categoryId}:`, err);
        } finally {
          setLoadingQuizzes(prev => ({ ...prev, [categoryId]: false }));
        }
      }
    }
  };

  /**
   * Navigate to a quiz
   * @param {number} quizId - ID of the quiz to navigate to
   */
  const handleQuizClick = (quizId) => {
    navigate(`/quizzes/${quizId}/take`);
  };

  // Show loading indicator when data is being fetched
  if (loading) return <div className="loading">Loading categories...</div>;

  // Show error state when fetching fails
  if (error) return <div className="error-message">{error}</div>;

  // Show empty state when no categories are available
  if (!categories || categories.length === 0) {
    return (
      <div className="empty-state">
        <h2>No categories available</h2>
        <p>Categories will appear here once they're added to the system.</p>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="page-title-container">
        <h1 className="page-title">Quiz Categories</h1>
      </div>

      <div className="categories-list">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div
              className="category-header"
              onClick={() => toggleCategory(category.id)}
            >
              <h2 className="category-title">{category.name}</h2>
              <span className="expand-icon">
                {expandedCategory === category.id ? '−' : '+'}
              </span>
            </div>

            <div className="category-description">
              {category.description || 'No description available'}
            </div>

            {expandedCategory === category.id && (
              <div className="category-quizzes">
                {loadingQuizzes[category.id] ? (
                  <div className="loading-quizzes">Loading quizzes...</div>
                ) : categoryQuizzes[category.id]?.length > 0 ? (
                  <div className="quiz-list-by-category">
                    <h3>Available Quizzes</h3>
                    {categoryQuizzes[category.id].map(quiz => (
                      <div
                        key={quiz.id}
                        className="quiz-item"
                        onClick={() => handleQuizClick(quiz.id)}
                      >
                        <div className="quiz-item-details">
                          <h4>{quiz.name}</h4>
                          <p>{quiz.description || 'No description'}</p>
                          <div className="quiz-item-meta">
                            <span>Course: {quiz.courseCode}</span>
                            <span>Questions: {quiz.questionCount}</span>
                          </div>
                        </div>
                        <button className="take-quiz-btn small">
                          Take Quiz
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-quizzes-message">
                    No quizzes available in this category.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryListPage;