import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryApi } from '../utils/api';

function CategoryList({ showToast }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryApi.getAll();
                setCategories(data);
            } catch (err) {
                showToast('Failed to fetch categories', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [showToast]);

    const createCategory = () => {
        navigate('/categories/new');
    };

    const deleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await categoryApi.delete(categoryId);
            setCategories(categories.filter(cat => cat.id !== categoryId));
            showToast("Category deleted successfully", "success");
        } catch (err) {
            showToast("Failed to delete category", "error");
        }
    };

    return (
        <div>
            <h1>Categories</h1>
            <button onClick={createCategory}>Create Category</button>
            {loading ? <div>Loading...</div> : (
                <ul>
                    {categories.map(cat => (
                        <li key={cat.id}>
                            {cat.name}
                            <button onClick={() => deleteCategory(cat.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CategoryList;
