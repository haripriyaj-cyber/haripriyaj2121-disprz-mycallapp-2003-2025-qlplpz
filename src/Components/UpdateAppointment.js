import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateAppointment.css';

function UpdateAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
    isAllDay: false,
    location: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch the appointment details when component mounts
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/api/appointments/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointment details');
        }
        
        const data = await response.json();
        
        // Format dates for input fields
        const formattedData = {
          ...data,
          startTime: formatDateForInput(data.startTime),
          endTime: formatDateForInput(data.endTime)
        };
        
        setAppointment(formattedData);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppointment({
      ...appointment,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare the data for API
      const appointmentData = {
        title: appointment.title,
        startTime: new Date(appointment.startTime).toISOString(),
        endTime: new Date(appointment.endTime).toISOString(),
        description: appointment.description || '',
        isAllDay: appointment.isAllDay,
        location: appointment.location || ''
      };
      
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }
      
      setSuccess(true);
      
      // Redirect back to appointments list after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading appointment details...</div>;
  }

  return (
    <div className="appointment-form-container">
      <h2>Update Appointment</h2>
      
      {success && (
        <div className="success-message">
          Appointment updated successfully! Redirecting...
        </div>
      )}
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={appointment.title}
            onChange={handleChange}
            required
            maxLength="100"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={appointment.startTime}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endTime">End Time</label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={appointment.endTime}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={appointment.description || ''}
            onChange={handleChange}
            maxLength="500"
            rows="4"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isAllDay"
              checked={appointment.isAllDay}
              onChange={handleChange}
            />
            All Day Event
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={appointment.location || ''}
            onChange={handleChange}
            maxLength="200"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateAppointment;
