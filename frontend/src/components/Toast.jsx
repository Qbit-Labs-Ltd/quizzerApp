import React, { useEffect } from 'react';
import '../styles/CommonStyles.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {type === 'success' && <span className="toast-icon">✅</span>}
        {type === 'error' && <span className="toast-icon">❌</span>}
        {type === 'warning' && <span className="toast-icon">⚠️</span>}
        <p>{message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;