import React, { useEffect } from 'react';

/**
 * Component for displaying feedback messages as a toast notification
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the toast is visible
 * @param {boolean} props.isCorrect - Whether the answer was correct
 * @param {string} props.message - The message to display
 * @param {Function} props.onClose - Callback when the toast is closed
 * @param {number} props.autoCloseTime - Time in ms after which the toast auto-closes
 * @returns {JSX.Element}
 */
const FeedbackToast = ({ 
  visible, 
  isCorrect, 
  message = '', 
  onClose, 
  autoCloseTime = 3000 
}) => {
  useEffect(() => {
    let timer;
    if (visible && autoCloseTime > 0) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, autoCloseTime, onClose]);
  
  if (!visible) return null;
  
  return (
    <div className={`feedback-toast ${isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {isCorrect ? '✓' : '✗'}
        </span>
        <span className="toast-message">{message || (isCorrect ? 'Correct!' : 'Try again')}</span>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default FeedbackToast; 