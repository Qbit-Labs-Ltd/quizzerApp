import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import '../styles/CommonStyles.css';

const DeleteQuestionButton = ({ questionId, onDelete, questionContent }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);
  
  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };
  
  const confirmDelete = () => {
    onDelete(questionId);
    setShowConfirmation(false);
  };

  return (
    <>
      <button 
        className={`delete-question-btn danger ${deleteHover ? 'hover-warning' : ''}`}
        onClick={handleDeleteClick}
        onMouseEnter={() => setDeleteHover(true)}
        onMouseLeave={() => setDeleteHover(false)}
        title="Delete this question"
      >
        {deleteHover ? (
          <>Warning</>
        ) : (
          <>
            <span className="delete-icon">🗑️</span> Delete
          </>
        )}
      </button>
      
      <ConfirmationModal
        isOpen={showConfirmation}
        title="Delete Question"
        message={
          <>
            <p>Are you sure you want to delete this question and all its answers?</p>
            {questionContent && (
              <div className="question-preview">
                <strong>Question:</strong> <span>{questionContent}</span>
              </div>
            )}
            <p className="warning-text">This action cannot be undone.</p>
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmation(false)}
      />
    </>
  );
};

export default DeleteQuestionButton;