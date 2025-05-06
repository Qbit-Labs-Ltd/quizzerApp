import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryApi } from '../utils/api';

function CategoryCreator({ showToast }) {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast('Category name cannot be empty', 'error');
            return;
        }
        try {
            await categoryApi.create({ name });
            showToast('Category created successfully!');
            navigate('/categories');
        } catch (err) {
            showToast('Failed to create category', 'error');
        }
    };

    return (
        <div>
            <h1>Create Category</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Category name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <button type="submit">Create</button>
            </form>
        </div>
    );
}

export default CategoryCreator;
