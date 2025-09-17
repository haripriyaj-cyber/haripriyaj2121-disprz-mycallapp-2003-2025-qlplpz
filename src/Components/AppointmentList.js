import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DeleteAppointment from './DeleteAppointment';
import './AppointmentList.css';

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

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
    // Parse the ISO string into a Date object
    const date = new Date(dateTimeStr);
    
    // Format the date using toLocaleString for better readability and correct time zone handling
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleAppointmentDeleted = (deletedId) => {
    // Update the state to remove the deleted appointment
    setAppointments(appointments.filter(appointment => appointment.id !== deletedId));
  };

  if (isLoading) {
    return <div className="loading">Loading appointments...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="appointment-list-container">
      <h2>Your Appointments</h2>
      
      <div className="create-button-container">
        <Link to="/create" className="create-btn">Create New Appointment</Link>
      </div>
      
      {appointments.length === 0 ? (
        <p className="no-appointments">No appointments found. Create one!</p>
      ) : (
        <div className="appointment-list">
          {appointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <h3>{appointment.title}</h3>
              <p className="appointment-time">
                <strong>Start:</strong> {formatDateTime(appointment.startTime)}
              </p>
              <p className="appointment-time">
                <strong>End:</strong> {formatDateTime(appointment.endTime)}
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
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentList;
