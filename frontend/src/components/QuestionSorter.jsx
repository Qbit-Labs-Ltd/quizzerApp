import React from 'react';
import '../styles/CommonStyles.css';

/**
 * Component for sorting questions by different criteria
 * Displays the questions count and provides a select dropdown for sorting options
 * 
 * @param {Object} props - Component props
 * @param {string} props.sortBy - Current sorting method
 * @param {Function} props.onSortChange - Function called when sort method changes
 * @param {number} props.questionsCount - Number of questions to display count
 * @returns {JSX.Element}
 */
const QuestionSorter = ({ sortBy, onSortChange, questionsCount }) => {
  return (
    <div className="question-sorter">
      {/* Display count of questions */}
      <div className="questions-count">
        <span>{questionsCount} {questionsCount === 1 ? 'Question' : 'Questions'}</span>
      </div>

      {/* Sorting dropdown control */}
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