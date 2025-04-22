import React from 'react';

const AnswerOption = ({ answer, index, onDelete }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.3rem',
      }}
    >
      <span>{answer}</span>

      {/* ✅ Only show delete if onDelete is provided */}
      {typeof onDelete === 'function' && (
        <button
          onClick={() => onDelete(index)}
          style={{ fontSize: '0.8rem' }}
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default AnswerOption;
