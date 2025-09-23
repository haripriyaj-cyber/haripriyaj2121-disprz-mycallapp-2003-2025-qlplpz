import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DeleteAppointment from './DeleteAppointment';
import { formatDateTimeForDisplay, getUserTimeZone } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import '../styles/AppointmentList.css';

function AppointmentList() {
  const { currentUser } = useAuth();
  const { darkMode } = useDarkMode();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // Add status filter
  const userTimeZone = getUserTimeZone();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Check if the device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // If user is logged in, fetch only their appointments
      let url = '/api/appointments';
      if (currentUser && currentUser.id) {
        url = `/api/appointments/user/${currentUser.id}`;
      }
      
      const response = await fetch(url);
      
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
  }, [currentUser]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Add this useEffect to listen for filter events
  useEffect(() => {
    const handleFilterAppointments = (event) => {
      const { status } = event.detail;
      setStatusFilter(status); // Update your existing status filter
    };

    document.addEventListener('filterAppointments', handleFilterAppointments);
    return () => {
      document.removeEventListener('filterAppointments', handleFilterAppointments);
    };
  }, []);

  const handleAppointmentDeleted = (deletedId) => {
    // Update the state to remove the deleted appointment
    setAppointments(appointments.filter(appointment => appointment.id !== deletedId));
  };

  // Function to determine appointment status
  const getAppointmentStatus = (appointment) => {
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    
    if (endTime < now) {
      // If the appointment has ended, it's "attended"
      return "attended";
    } else if (startTime < now && endTime > now) {
      // If the appointment is currently happening, it's "recent"
      return "recent";
    } else {
      // If the appointment is in the future, it's "upcoming"
      return "upcoming";
    }
  };

  // Filter appointments based on status
  const filteredAppointments = appointments.filter(appointment => {
    if (statusFilter === 'all') return true;
    return getAppointmentStatus(appointment) === statusFilter;
  });

  // Get recent appointments
  const recentAppointments = appointments.filter(appointment => 
    getAppointmentStatus(appointment) === 'recent'
  );

  // Get upcoming appointments
  const upcomingAppointments = appointments.filter(appointment => 
    getAppointmentStatus(appointment) === 'upcoming'
  );

  // Add this debugging code to AppointmentList.js
  useEffect(() => {
    console.log("AppointmentList - appointments:", appointments);
    console.log("AppointmentList - recentAppointments:", recentAppointments);
    console.log("AppointmentList - upcomingAppointments:", upcomingAppointments);
  }, [appointments, recentAppointments, upcomingAppointments]);

  if (isLoading) {
    return <div className="loading">Loading appointments...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className={`appointment-list-container ${darkMode ? 'dark-mode' : ''}`}>
      <h2>Your Appointments</h2>
      <p className="time-zone-info" style={{fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#666'}}>
        All times shown in {userTimeZone}
      </p>
      
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn attended ${statusFilter === 'attended' ? 'active' : ''}`}
          onClick={() => setStatusFilter('attended')}
        >
          Attended
        </button>
        <button 
          className={`filter-btn recent ${statusFilter === 'recent' ? 'active' : ''}`}
          onClick={() => setStatusFilter('recent')}
        >
          Recent
        </button>
        <button 
          className={`filter-btn upcoming ${statusFilter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setStatusFilter('upcoming')}
        >
          Upcoming
        </button>
      </div>
      
      <div className="create-button-container">
        <Link to="/create" className="create-btn">Create New Appointment</Link>
      </div>
      
      {/* Mobile view for Recent & Upcoming */}
      {isMobile && (
        <div className="mobile-recent-upcoming">
          {/* Recent appointments section */}
          <div className="mobile-section">
            <h3>Recent Appointments</h3>
            {recentAppointments.length === 0 ? (
              <p className="no-appointments">No recent appointments</p>
            ) : (
              <div className="mobile-appointment-list">
                {recentAppointments.map(appointment => (
                  <div key={appointment.id} className="mobile-appointment-card recent">
                    <div className="mobile-appointment-time">
                      {formatDateTimeForDisplay(appointment.startTime)}
                    </div>
                    <h4 className="mobile-appointment-title">{appointment.title}</h4>
                    {appointment.location && (
                      <div className="mobile-appointment-location">
                        Location: {appointment.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Upcoming appointments section */}
          <div className="mobile-section">
            <h3>Upcoming Appointments</h3>
            {upcomingAppointments.length === 0 ? (
              <p className="no-appointments">No upcoming appointments</p>
            ) : (
              <div className="mobile-appointment-list">
                {upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="mobile-appointment-card upcoming">
                    <div className="mobile-appointment-time">
                      {formatDateTimeForDisplay(appointment.startTime)}
                    </div>
                    <h4 className="mobile-appointment-title">{appointment.title}</h4>
                    {appointment.location && (
                      <div className="mobile-appointment-location">
                        Location: {appointment.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Regular appointment list (shown based on filter) */}
      {(!isMobile || (isMobile && statusFilter !== 'all')) && (
        filteredAppointments.length === 0 ? (
          <p className="no-appointments">No appointments found. Create one!</p>
        ) : (
          <div className="appointment-list">
            {filteredAppointments.map(appointment => {
              const status = getAppointmentStatus(appointment);
              return (
                <div key={appointment.id} className={`appointment-card status-${status}`}>
                  <h3>{appointment.title}</h3>
                  <p className="appointment-time">
                    <strong>Start:</strong> {formatDateTimeForDisplay(appointment.startTime)}
                  </p>
                  <p className="appointment-time">
                    <strong>End:</strong> {formatDateTimeForDisplay(appointment.endTime)}
                  </p>
                  {appointment.location && (
                    <p className="appointment-location">
                      <strong>Location:</strong> {appointment.location}
                    </p>
                  )}
                  {appointment.description && (
                    <p className="appointment-description">
                      <strong>Description:</strong> {appointment.description}
                    </p>
                  )}
                  <p className="appointment-all-day">
                    <strong>All Day:</strong> {appointment.isAllDay ? 'Yes' : 'No'}
                  </p>
                  <div className="appointment-actions">
                    <Link 
                      to={`/update-appointment/${appointment.id}`} 
                      className="update-btn"
                    >
                      Edit
                    </Link>
                    <DeleteAppointment 
                      appointmentId={appointment.id} 
                      onAppointmentDeleted={handleAppointmentDeleted} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

export default AppointmentList;
