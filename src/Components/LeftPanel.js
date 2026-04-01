import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faChevronLeft, 
  faChevronRight, 
  faClock,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/LeftPanel.css';

function LeftPanel({ 
  appointments, 
  selectedDate, 
  isLoading, 
  error, 
  navigateDay, 
  handleDateChange, 
  handleUpcomingClick, 
  formatDateTime,
  formatDate,
  selectedAppointmentId,
  onAppointmentSelect,
  darkMode // Add darkMode prop
}) {
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

  // Handle appointment card click - just highlight the time slot without showing details
  const handleAppointmentClick = (appointmentId) => {
    // Create a custom event to just highlight the slot without showing details
    const customEvent = new CustomEvent('highlightTimeSlot', {
      detail: { appointmentId }
    });
    document.dispatchEvent(customEvent);
    
    // Still call onAppointmentSelect to maintain selection state
    onAppointmentSelect(appointmentId);
  };

  // Handle date change from calendar
  const handleCalendarDateChange = (date) => {
    handleDateChange({ target: { value: date.toISOString().split('T')[0] } });
  };

  if (isLoading) {
    return <div className={`scheduler-left-panel loading ${darkMode ? 'dark-mode' : ''}`}>Loading appointments...</div>;
  }

  if (error) {
    return <div className={`scheduler-left-panel error ${darkMode ? 'dark-mode' : ''}`}>Error: {error}</div>;
  }

  return (
    <div className={`scheduler-left-panel ${darkMode ? 'dark-mode' : ''}`}>
      <div className="scheduler-header">
        <div className="header-content">
          <div className="header-icon">
            <FontAwesomeIcon icon={faCalendarAlt} size="2x" />
          </div>
          <div className="header-text">
            <h2>Appointments</h2>
            <p className="scheduler-subheader">Manage your schedule</p>
          </div>
        </div>
      </div>
      
      <div className="date-navigation">
        <button onClick={() => navigateDay(-1)} className="nav-arrow">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="date-picker">
          <div className="date-display">
            {selectedDate.toLocaleDateString()}
            <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
          </div>
        </div>
        <button onClick={() => navigateDay(1)} className="nav-arrow">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Compact Calendar Component with minimal header (no navigation buttons) */}
      <div className="calendar-container">
        <DatePicker
          selected={selectedDate}
          onChange={handleCalendarDateChange}
          inline
          calendarClassName={`left-panel-calendar ${darkMode ? 'dark-mode-calendar' : ''}`}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          yearDropdownItemNumber={7}
          fixedHeight
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="compact-calendar-header">
              {/* Month and Year selectors only, no navigation buttons */}
              <div className="month-year-selectors">
                <select
                  value={date.getMonth()}
                  onChange={({ target: { value } }) => changeMonth(value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(date.getFullYear(), i, 1).toLocaleString('default', { month: 'short' })}
                    </option>
                  ))}
                </select>
                <select
                  value={date.getFullYear()}
                  onChange={({ target: { value } }) => changeYear(value)}
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={date.getFullYear() - 5 + i}>
                      {date.getFullYear() - 5 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        />
      </div>
    
      {/* Fixed Section Header */}
      <div className="section-header">
        <h4>Recent & Upcoming</h4>
      </div>
    
      {/* Scrollable Appointments Section */}
      <div className="daily-appointments-section">
        {filteredAppointments.length === 0 ? (
          <p className="no-appointments">No recent or upcoming appointments for this day</p>
        ) : (
          <div className="appointment-list">
            {filteredAppointments.map(appointment => {
              const status = getAppointmentStatus(appointment);
              const isSelected = appointment.id === selectedAppointmentId;
              
              return (
                <div 
                  key={appointment.id} 
                  className={`appointment-card ${isSelected ? 'selected-appointment' : ''}`}
                  onClick={() => handleAppointmentClick(appointment.id)}
                >
                  <div className="appointment-icon">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div className="appointment-content">
                    <div className="appointment-time">
                      {formatDateTime(appointment.startTime)}
                    </div>
                    <h5 className="appointment-title">{appointment.title}</h5>
                    {appointment.description && (
                      <p className="appointment-description">
                        {appointment.description.length > 60 
                          ? `${appointment.description.substring(0, 60)}...` 
                          : appointment.description}
                      </p>
                    )}
                    <div className="appointment-location">
                      {appointment.location && (
                        <span>
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" /> {appointment.location}
                        </span>
                      )}
                    </div>
                    <div className="appointment-actions">
                      <button 
                        className={`status-btn ${status}-btn`}
                        onClick={(e) => handleUpcomingClick(appointment.id, e)}
                      >
                        {status === 'upcoming' ? 'Upcoming' : 'Recent'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeftPanel;
