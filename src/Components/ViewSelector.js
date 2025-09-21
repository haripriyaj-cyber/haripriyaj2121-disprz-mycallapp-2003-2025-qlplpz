import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarWeek, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/ViewSelector.css';

function ViewSelector({ currentView, onViewChange }) {
  return (
    <div className="view-selector">
      <select 
        value={currentView} 
        onChange={(e) => onViewChange(e.target.value)}
        className="view-select"
      >
        <option value="day">
          Day View
        </option>
        <option value="week">
          Week View
        </option>
        <option value="month">
          Month View
        </option>
      </select>
      <div className="view-icon">
        <FontAwesomeIcon 
          icon={currentView === 'month' ? faCalendarAlt : faCalendarWeek} 
        />
      </div>
    </div>
  );
}

export default ViewSelector;