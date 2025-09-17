import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DeleteAppointment from './DeleteAppointment';
import './CalendarView.css';

function CalendarView() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/appointments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const navigateDay = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const handleUpcomingClick = (appointmentId, e) => {
    e.stopPropagation();
    console.log(`Upcoming button clicked for appointment ${appointmentId}`);
  };

  const handleAppointmentDeleted = (deletedId) => {
    // Update the state to remove the deleted appointment
    setAppointments(appointments.filter(appointment => appointment.id !== deletedId));
  };

  // Filter appointments for the selected day
  const dailyAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  });

  // Sort appointments by time
  dailyAppointments.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  if (isLoading) {
    return <div className="scheduler-left-panel loading">Loading appointments...</div>;
  }

  if (error) {
    return <div className="scheduler-left-panel error">Error: {error}</div>;
  }

  return (
    <div className="scheduler-container">
      <div className="scheduler-left-panel">
        <div className="scheduler-header">
          <div className="header-content">
            <div className="header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z"/>
                <path d="M11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
              </svg>
            </div>
            <div className="header-text">
              <h2>Appointments</h2>
              <p className="scheduler-subheader">Manage your schedule</p>
            </div>
          </div>
        </div>
        
        <div className="date-navigation">
          <button onClick={() => navigateDay(-1)} className="nav-arrow">
            &larr;
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
            &rarr;
          </button>
        </div>

        <div className="daily-appointments-section">
          <h4>Recent & Upcoming</h4>
          {dailyAppointments.length === 0 ? (
            <p className="no-appointments">No appointments for this day</p>
          ) : (
            <div className="appointment-list">
              {dailyAppointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
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
                        <span>{appointment.location}</span>
                      )}
                    </div>
                    <div className="appointment-actions">
                      <button 
                        className="upcoming-btn"
                        onClick={(e) => handleUpcomingClick(appointment.id, e)}
                      >
                        Upcoming
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
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="scheduler-main-content">
        <div className="main-content-header">
          <Link to="/create" className="create-appointment-btn">
            + New Appointment
          </Link>
        </div>
        <div className="placeholder-content">
          <h2>Select an appointment to view details</h2>
          <p>Or create a new appointment to add to your schedule</p>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
