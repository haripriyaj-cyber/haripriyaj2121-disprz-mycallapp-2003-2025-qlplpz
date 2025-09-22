import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faMoon, 
  faSun 
} from '@fortawesome/free-solid-svg-icons';
import { useDarkMode } from '../contexts/DarkModeContext';
import '../styles/CalendarHeader.css';

function CalendarHeader({
  title,
  viewMode,
  onViewModeChange,
  onNavigatePrevious,
  onNavigateNext,
  navigationType = 'day', // 'day', 'week', or 'month'
}) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const navigateToNewAppointment = () => {
    navigate('/create');
  };

  return (
    <div className="calendar-header">
      <div className="calendar-title">
        <h2>{title}</h2>
      </div>
      
      <div className="calendar-controls">
        <button 
          className="dark-mode-toggle" 
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
        </button>
        
        <div className={`${navigationType}-navigation`}>
          <button 
            className={`${navigationType}-nav-btn`} 
            onClick={onNavigatePrevious}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <button 
            className={`${navigationType}-nav-btn`} 
            onClick={onNavigateNext}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        <div className="header-controls">
          <select 
            className="view-mode-dropdown" 
            value={viewMode || 'day'} 
            onChange={onViewModeChange}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          
          <button 
            onClick={navigateToNewAppointment}
            className="create-appointment-btn"
          >
            + New Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarHeader;