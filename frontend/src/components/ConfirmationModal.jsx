import React from 'react';
import '../styles/CommonStyles.css';

/**
 * Modal component for confirming potentially destructive actions
 * Displays a warning with confirm/cancel buttons
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - The confirmation message to display
 * @param {Function} props.onConfirm - Function called when action is confirmed
 * @param {Function} props.onCancel - Function called when action is cancelled
 * @returns {JSX.Element|null} Returns null when not open
 */
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    // Don't render anything if the modal is closed
    if (!isOpen) return null;

    return (
        // Backdrop that closes modal when clicked
        <div className="modal-overlay" onClick={onCancel}>
            {/* Modal content that prevents click propagation */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {/* Modal header with title and close button */}
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onCancel}>×</button>
                </div>

                {/* Modal body with warning message */}
                <div className="modal-body">
                    <div className="warning-icon">⚠️</div>
                    <p>{message}</p>
                </div>

                {/* Modal action buttons */}
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