import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryListService from '../utils/CategoryListService';
import '../styles/CommonStyles.css';
import '../styles/Category.css';

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
  const [editingCategory, setEditingCategory] = useState(null);
  const [editDescription, setEditDescription] = useState('');
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
      setExpandedCategory(null);
    } else {
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
   * Start editing a category's description
   * @param {number} categoryId - ID of the category to edit
   * @param {string} currentDescription - Current description of the category
   */
  const handleStartEdit = (categoryId, currentDescription) => {
    setEditingCategory(categoryId);
    setEditDescription(currentDescription || '');
  };

  /**
   * Save the edited category description
   * @param {number} categoryId - ID of the category being edited
   */
  const handleSaveEdit = async (categoryId) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      const updatedCategory = await CategoryListService.updateCategory(categoryId, {
        name: category.name, // Include the existing name
        description: editDescription
      });

      setCategories(categories.map(cat =>
        cat.id === categoryId ? updatedCategory : cat
      ));

      setEditingCategory(null);
      setEditDescription('');
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.response?.data?.error || 'Failed to update category description');
    }
  };

  /**
   * Delete a category
   * @param {number} categoryId - ID of the category to delete
   */
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await CategoryListService.deleteCategory(categoryId);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      if (expandedCategory === categoryId) {
        setExpandedCategory(null);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      if (err.response?.status === 409) {
        setError('Cannot delete category: It contains quizzes. Please remove or reassign the quizzes first.');
      } else {
        setError('Failed to delete category');
      }
    }
  };

  // Show loading indicator when data is being fetched
  if (loading) return <div className="loading">Loading categories...</div>;

  // Show error state when fetching fails
  if (error) return <div className="error-message">{error}</div>;

  // Show empty state when no categories are available
  if (!categories || categories.length === 0) {
    return (
      <div className="categories-container">
        <div className="page-title-container">
          <h1 className="page-title">Quiz Categories</h1>
          <button
            className="btn btn-primary create-btn"
            onClick={() => navigate('/categories/new')}
          >
            Create Category
          </button>
        </div>
        <div className="empty-state">
          <h2>No categories available</h2>
          <p>Get started by creating your first category to organize your quizzes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="page-title-container">
        <h1 className="page-title">Quiz Categories</h1>
        <button
          className="btn btn-primary create-btn"
          onClick={() => navigate('/categories/new')}
        >
          Create Category
        </button>
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
              {editingCategory === category.id ? (
                <div className="edit-description">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter category description"
                    rows="3"
                  />
                  <div className="edit-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSaveEdit(category.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingCategory(null);
                        setEditDescription('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="description-content">
                  <p>{category.description || 'No description available'}</p>
                  <div className="description-actions">
                    <button
                      className="btn btn-text"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(category.id, category.description);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-text danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

            {expandedCategory === category.id && (
              <div className="category-quizzes">
                {loadingQuizzes[category.id] ? (
                  <div className="loading-quizzes">Loading quizzes...</div>
                ) : categoryQuizzes[category.id]?.length > 0 ? (
                  <div className="quiz-list-by-category">
                    <h3>Available Quizzes</h3>
                    <div className='quizzes-by-category'>
                      {categoryQuizzes[category.id].map(quiz => (
                        <div
                          key={quiz.id}
                          className="category-quiz-item"
                          onClick={() => navigate(`/quizzes/${quiz.id}/take`)}>
                          <div className="quiz-item-details">
                            <h4>{quiz.name}</h4>
                            <p>{quiz.description || 'No description'}</p>
                            <p className='quiz-card-course'>Course: {quiz.courseCode}</p>
                            <p className='quiz-card-questions'>Questions: {quiz.questionCount}</p>
                          </div>
                          <button className="take-quiz-btn small">
                            Open Quiz
                          </button>
                        </div>
                      ))}
                    </div>
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