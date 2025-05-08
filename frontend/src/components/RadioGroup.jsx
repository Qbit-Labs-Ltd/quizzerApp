import React from 'react';

/**
 * A reusable radio group component for selecting a single option from a list
 * 
 * @param {Object} props - Component props
 * @param {Array} props.options - Array of options with id, label, and value
 * @param {string} props.name - Name attribute for the radio button group
 * @param {string} props.selectedValue - Currently selected value
 * @param {Function} props.onChange - Callback when selection changes
 * @param {boolean} props.disabled - Whether the radio group is disabled
 * @returns {JSX.Element}
 */
function RadioGroup({ 
  options, 
  name, 
  selectedValue, 
  onChange, 
  disabled = false 
}) {
  if (!options || options.length === 0) {
    return <div className="empty-options">No options available</div>;
  }

  return (
    <div className="radio-group">
      {options.map(option => (
        <div 
          key={option.id} 
          className={`radio-option ${selectedValue === option.value ? 'selected' : ''}`}
          onClick={() => !disabled && onChange(option.value)}
        >
          <input
            type="radio"
            id={`${name}-${option.id}`}
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
          />
          <label htmlFor={`${name}-${option.id}`}>{option.label}</label>
        </div>
      ))}
    </div>
  );
}

export default RadioGroup; 