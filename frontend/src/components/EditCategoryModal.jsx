import React, { useState } from 'react';
import CategoryListService from '../utils/CategoryListService';

const EditCategoryModal = ({ category, onClose, onSuccess, showToast }) => {
    const [editData, setEditData] = useState({
        name: category.name,
        description: category.description || ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const updatedCategory = await CategoryListService.updateCategory(category.id, editData);
            showToast('Category updated successfully!', 'success');
            onSuccess(updatedCategory);
            onClose();
        } catch (error) {
            console.error('Error updating category:', error);
            showToast(error.response?.data?.error || 'Failed to update category', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-content">
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="name" className="form-label">
                        Category Name <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={editData.name}
                        onChange={handleChange}
                        className="form-input"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description" className="form-label">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={editData.description}
                        onChange={handleChange}
                        className="form-textarea"
                        rows={4}
                        disabled={isSubmitting}
                    />
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCategoryModal;
