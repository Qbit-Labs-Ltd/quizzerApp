import React, { useState } from 'react';
import CategoryListService from '../utils/CategoryListService';
import '../styles/CommonStyles.css';

/**
 * Component for creating new categories
 * 
 * @param {Object} props - Component props
 * @param {Function} props.showToast - Function to show toast notifications
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSuccess - Function to call on successful category creation
 * @returns {JSX.Element}
 */
const CategoryCreator = ({ onClose, showToast, onSuccess }) => {
    const [categoryData, setCategoryData] = useState({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Handle input field changes
     * @param {Event} e - Input change event
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoryData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    /**
     * Validate form data before submission
     * @returns {boolean} Whether the data is valid
     */
    const validateForm = () => {
        const newErrors = {};

        if (!categoryData.name.trim()) {
            newErrors.name = 'Category name is required';
        } else if (categoryData.name.length > 50) {
            newErrors.name = 'Category name must be 50 characters or less';
        }

        if (categoryData.description && categoryData.description.length > 500) {
            newErrors.description = 'Description must be 500 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const createdCategory = await CategoryListService.createCategory(categoryData);
            showToast('Category created successfully!', 'success');
            onSuccess(createdCategory);
            onClose();
        } catch (error) {
            console.error('Error creating category:', error);
            if (error.response?.data?.error) {
                showToast(error.response.data.error, 'error');
            } else {
                showToast('Failed to create category. Please try again later.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Category Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={categoryData.name}
                            onChange={handleChange}
                            className={`form-input ${errors.name ? 'input-error' : ''}`}
                            placeholder="Enter category name"
                            disabled={isSubmitting}
                        />
                        {errors.name && <div className="error-message">{errors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={categoryData.description}
                            onChange={handleChange}
                            className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                            placeholder="Enter category description (optional)"
                            rows={4}
                            disabled={isSubmitting}
                        />
                        {errors.description && <div className="error-message">{errors.description}</div>}
                    </div>
                </form>
            </div>

            <div className="modal-actions">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
            </div>
        </>
    );
};

export default CategoryCreator;
