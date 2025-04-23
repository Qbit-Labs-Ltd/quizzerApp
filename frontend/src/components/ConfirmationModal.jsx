import React from 'react';
import '../styles/CommonStyles.css';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onCancel}>×</button>
                </div>
                
                <div className="modal-body">
                    <div className="warning-icon">⚠️</div>
                    <p>{message}</p>
                </div>

                <div className="modal-actions">
                    <button
                        className="cancel-button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="confirm-button danger"
                        onClick={onConfirm}
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;