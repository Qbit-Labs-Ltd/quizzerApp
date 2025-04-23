import React from 'react';
import '../styles/CommonStyles.css';

const QuestionSorter = ({ sortBy, onSortChange, questionsCount }) => {
  return (
    <div className="question-sorter">
      <div className="questions-count">
        <span>{questionsCount} {questionsCount === 1 ? 'Question' : 'Questions'}</span>
      </div>
      <div className="sorter-container">
        <label htmlFor="question-sort">Sort by:</label>
        <select 
          id="question-sort" 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="orderAdded">Order Added</option>
          <option value="difficultyAsc">Difficulty (Easy → Hard)</option>
          <option value="difficultyDesc">Difficulty (Hard → Easy)</option>
          <option value="contentAsc">Content (A-Z)</option>
          <option value="contentDesc">Content (Z-A)</option>
        </select>
      </div>
    </div>
  );
};

export default QuestionSorter;