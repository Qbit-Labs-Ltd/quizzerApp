import React, { useEffect } from 'react';
import '../styles/CommonStyles.css';

/**
 * Toast notification component for displaying temporary feedback messages
 * Automatically disappears after the specified duration
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - The message to display in the toast
 * @param {string} props.type - The type of toast (success, error, warning)
 * @param {Function} props.onClose - Function called when toast is closed
 * @param {number} props.duration - How long to display the toast in milliseconds
 * @returns {JSX.Element}
 */
const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  // Set up auto-dismiss timer
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {/* Display appropriate icon based on toast type */}
        {type === 'success' && <span className="toast-icon">✅</span>}
        {type === 'error' && <span className="toast-icon">❌</span>}
        {type === 'warning' && <span className="toast-icon">⚠️</span>}
        <p>{message}</p>
      </div>
      {/* Close button */}
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;