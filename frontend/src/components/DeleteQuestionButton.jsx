import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import '../styles/CommonStyles.css';

/**
 * Button component with built-in confirmation functionality for deleting questions
 * Displays a warning on hover and shows a confirmation modal before deletion
 * 
 * @param {Object} props - Component props
 * @param {number} props.questionId - ID of the question to delete
 * @param {Function} props.onDelete - Function to call when deletion is confirmed
 * @param {string} props.questionContent - Text content of the question to display in confirmation
 * @returns {JSX.Element}
 */
const DeleteQuestionButton = ({ questionId, onDelete, questionContent }) => {
  // State for controlling modal visibility and hover effect
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  /**
   * Opens the confirmation modal when delete is clicked
   */
  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  /**
   * Executes deletion when confirmed and closes the modal
   */
  const confirmDelete = () => {
    onDelete(questionId);
    setShowConfirmation(false);
  };

  return (
    <>
      {/* Delete button with hover warning effect */}
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

      {/* Confirmation modal for delete action */}
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