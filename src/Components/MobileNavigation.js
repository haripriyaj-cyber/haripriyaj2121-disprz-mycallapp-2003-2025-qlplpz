import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faTimes, 
  faCalendarDay,
  faCalendarWeek,
  faCalendarAlt,
  faMoon, 
  faSun,
  faSignOutAlt,
  faUser,
  faPlus,
  faClock,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/MobileNavigation.css';

function MobileNavigation({ 
  viewMode, 
  onViewModeChange, 
  selectedDate,
  appointments = [],
  onAppointmentSelect
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { logout, currentUser } = useAuth();

  // Close menu when navigating
  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    onViewModeChange({ target: { value: mode } });
    setIsOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Get display name
  const getDisplayName = () => {
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.username) return currentUser.username;
    
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    
    return "User";
  };

  // Filter appointments for the selected day
  const dailyAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  });

  // Sort appointments by time
  dailyAppointments.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  // Function to determine appointment status
  const getAppointmentStatus = (appointment) => {
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    
    if (now < startTime) {
      return 'upcoming';
    } else if (now >= startTime && now <= endTime) {
      return 'recent';
    } else {
      return 'attended';
    }
  };

  // Filter out attended appointments - only show recent and upcoming
  const filteredAppointments = dailyAppointments.filter(appointment => {
    const status = getAppointmentStatus(appointment);
    return status === 'upcoming' || status === 'recent';
  });

  // Handle appointment card click
  const handleAppointmentClick = (appointmentId) => {
    // Create a custom event to highlight the time slot
    const customEvent = new CustomEvent('highlightTimeSlot', {
      detail: { appointmentId }
    });
    document.dispatchEvent(customEvent);
    
    // Call onAppointmentSelect to maintain selection state
    if (onAppointmentSelect) {
      onAppointmentSelect(appointmentId);
    }
    
    // Close the menu
    setIsOpen(false);
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-nav-menu') && 
          !event.target.closest('.hamburger-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="mobile-nav-container">
      <button 
        className="hamburger-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      
      <div className={`mobile-nav-menu ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}>
        <div className="mobile-nav-header">
          <h2>Calendar App</h2>
          <button 
            className="close-menu-button" 
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="mobile-nav-user">
          <FontAwesomeIcon icon={faUser} />
          <span>{getDisplayName()}</span>
        </div>
        
        <div className="mobile-nav-section">
          <h3>View Mode</h3>
          <div className="mobile-nav-buttons">
            <button 
              className={`mobile-nav-button ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('day')}
            >
              <FontAwesomeIcon icon={faCalendarDay} />
              <span>Day</span>
            </button>
            <button 
              className={`mobile-nav-button ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('week')}
            >
              <FontAwesomeIcon icon={faCalendarWeek} />
              <span>Week</span>
            </button>
            <button 
              className={`mobile-nav-button ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('month')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>Month</span>
            </button>
          </div>
        </div>
        
        <div className="mobile-nav-section">
          <h3>Actions</h3>
          <div className="mobile-nav-buttons">
            <button 
              className="mobile-nav-button"
              onClick={() => handleNavigation('/create')}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>New Appointment</span>
            </button>
            <button 
              className="mobile-nav-button"
              onClick={toggleDarkMode}
            >
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
        
        {/* Recent & Upcoming section with appointment cards */}
        <div className="mobile-nav-section">
          <h3>Recent & Upcoming</h3>
          
          <div className="mobile-appointments-container">
            {filteredAppointments.length === 0 ? (
              <p className="mobile-no-appointments">No recent or upcoming appointments for this day</p>
            ) : (
              <div className="mobile-appointment-list">
                {filteredAppointments.map(appointment => {
                  const status = getAppointmentStatus(appointment);
                  
                  return (
                    <div 
                      key={appointment.id} 
                      className={`mobile-appointment-card status-${status}`}
                      onClick={() => handleAppointmentClick(appointment.id)}
                    >
                      <div className="mobile-appointment-icon">
                        <FontAwesomeIcon icon={faClock} />
                      </div>
                      <div className="mobile-appointment-content">
                        <div className="mobile-appointment-time">
                          {formatTime(appointment.startTime)}
                        </div>
                        <h5 className="mobile-appointment-title">{appointment.title}</h5>
                        {appointment.description && (
                          <p className="mobile-appointment-description">
                            {appointment.description.length > 60 
                              ? `${appointment.description.substring(0, 60)}...` 
                              : appointment.description}
                          </p>
                        )}
                        {appointment.location && (
                          <div className="mobile-appointment-location">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" /> {appointment.location}
                          </div>
                        )}
                        <div className="mobile-appointment-status">
                          <span className={`status-indicator ${status}`}>
                            {status === 'upcoming' ? 'Upcoming' : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="mobile-nav-footer">
          <button 
            className="mobile-nav-button logout"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {isOpen && <div className="mobile-nav-overlay" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
}

export default MobileNavigation;
