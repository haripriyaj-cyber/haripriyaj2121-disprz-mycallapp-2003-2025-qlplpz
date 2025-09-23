import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faMoon, 
  faSun,
  faSignOutAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';
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
  const { logout, currentUser } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const navigateToNewAppointment = () => {
    navigate('/create');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Get display name - prioritize name over email
  const getDisplayName = () => {
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.username) return currentUser.username;
    
    // If email exists, extract the part before @ as a fallback username
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    
    return "User";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="calendar-header">
      <div className="calendar-title">
        <h2>{title}</h2>
      </div>
      
      <div className="header-buttons-container">
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
        
        <div className="profile-container" ref={dropdownRef}>
          <button 
            className="profile-btn"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            aria-label="User profile"
          >
            <FontAwesomeIcon icon={faUser} />
          </button>
          
          {showProfileDropdown && (
            <div className="profile-dropdown">
              <div className="profile-username">
                {getDisplayName()}
              </div>
              <button 
                onClick={handleLogout}
                className="profile-logout-btn"
              >
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarHeader;