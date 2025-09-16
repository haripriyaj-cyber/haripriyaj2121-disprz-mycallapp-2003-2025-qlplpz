import React, { useState, useEffect } from 'react';
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
    return date.toLocaleString();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const response = await fetch(`'/api/appointments'/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Remove the deleted appointment from the state
          setAppointments(appointments.filter(appointment => appointment.id !== id));
        } else {
          throw new Error('Failed to delete appointment');
        }
      } catch (error) {
        setError(error.message);
      }
    }
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
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(appointment.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentList;
