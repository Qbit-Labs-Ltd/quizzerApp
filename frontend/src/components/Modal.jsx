import React from 'react';
import '../styles/CommonStyles.css';

/**
 * Generic Modal component for displaying any content in a centered popup
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Function to close the modal
 * @param {React.ReactNode} props.children - Content to display inside the modal
 * @param {string} [props.title] - Optional modal title
 */
const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    {title && <h2>{title}</h2>}
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal; 