import React from 'react';
import { Link } from 'react-router-dom';
import DeleteAppointment from './DeleteAppointment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faChevronLeft, 
  faChevronRight, 
  faClock,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import '../styles/LeftPanel.css';

function LeftPanel({ 
  appointments, 
  selectedDate, 
  isLoading, 
  error, 
  navigateDay, 
  handleDateChange, 
  handleUpcomingClick, 
  handleAppointmentDeleted,
  formatDateTime,
  formatDate,
  selectedAppointmentId,
  onAppointmentSelect
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

  // Handle appointment card click
  const handleAppointmentClick = (appointmentId) => {
    onAppointmentSelect(appointmentId);
  };

  if (isLoading) {
    return <div className="scheduler-left-panel loading">Loading appointments...</div>;
  }

  if (error) {
    return <div className="scheduler-left-panel error">Error: {error}</div>;
  }

  return (
    <div className="scheduler-left-panel">
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
          <h3>{formatDate(selectedDate)}</h3>
          <input 
            type="date" 
            value={selectedDate.toISOString().split('T')[0]} 
            onChange={handleDateChange}
          />
        </div>
        <button onClick={() => navigateDay(1)} className="nav-arrow">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      <div className="daily-appointments-section">
        <h4>Recent & Upcoming</h4>
        {dailyAppointments.length === 0 ? (
          <p className="no-appointments">No appointments for this day</p>
        ) : (
          <div className="appointment-list">
            {dailyAppointments.map(appointment => {
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
                        {status === 'upcoming' ? 'Upcoming' : 
                         status === 'recent' ? 'Recent' : 'Attended'}
                      </button>
                      <Link 
                        to={`/update-appointment/${appointment.id}`}
                        className="edit-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <div className="delete-btn-container" onClick={(e) => e.stopPropagation()}>
                        <DeleteAppointment 
                          appointmentId={appointment.id} 
                          onAppointmentDeleted={handleAppointmentDeleted}
                        />
                      </div>
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
