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
  const [message, setMessage] = useState('');

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
        setMessage(`Error: ${error.message}`);
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString) => {
    // Create a date object from the ISO string
    const date = new Date(dateString);
    
    // Format to YYYY-MM-DDTHH:MM (format required by datetime-local input)
    // Use padStart to ensure 2 digits for month, day, hours, minutes
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppointment({
      ...appointment,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Validate that end time is after start time
  const validateTimeRange = () => {
    if (appointment.startTime && appointment.endTime) {
      const start = new Date(appointment.startTime);
      const end = new Date(appointment.endTime);
      
      if (end <= start) {
        return "End time must be after start time";
      }
    }
    return null;
  };

  const checkTimeSlotAvailability = async (startTime, endTime) => {
    try {
      // Fetch all existing appointments
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const appointments = await response.json();
      
      // Convert input times to Date objects for comparison
      const newStart = new Date(startTime);
      const newEnd = new Date(endTime);
      
      // Check for overlaps with existing appointments, excluding the current appointment
      const conflictingAppointment = appointments.find(appointment => {
        // Skip comparing with the current appointment being edited
        if (appointment.id === parseInt(id)) {
          return false;
        }
        
        const existingStart = new Date(appointment.startTime);
        const existingEnd = new Date(appointment.endTime);
        
        // Check if the new appointment overlaps with an existing one
        return (
          (newStart >= existingStart && newStart < existingEnd) || // New start time is within existing appointment
          (newEnd > existingStart && newEnd <= existingEnd) || // New end time is within existing appointment
          (newStart <= existingStart && newEnd >= existingEnd) // New appointment completely encompasses existing appointment
        );
      });
      
      return conflictingAppointment ? false : true;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // Create Date objects from the form inputs
      const startDate = new Date(appointment.startTime);
      const endDate = new Date(appointment.endTime);
      
      // Prepare the data for API with proper ISO strings
      const appointmentData = {
        title: appointment.title,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        description: appointment.description || '',
        isAllDay: appointment.isAllDay,
        location: appointment.location || ''
      };
      
      // First check if the time slot is available
      const isTimeSlotAvailable = await checkTimeSlotAvailability(
        appointmentData.startTime, 
        appointmentData.endTime
      );
      
      if (!isTimeSlotAvailable) {
        setMessage('Error: This time slot is already booked. Please select a different time.');
        setIsSubmitting(false);
        return;
      }
      
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
      
      setMessage('Appointment updated successfully!');
      
      // Redirect back to appointments list after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeRangeError = validateTimeRange();

  if (isLoading) {
    return <div className="loading">Loading appointment details...</div>;
  }

  return (
    <div className="appointment-form-container">
      <h2>Update Appointment</h2>
      
      {message && <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
        {message}
      </div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={appointment.title}
            onChange={handleChange}
            required
            maxLength={100}
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
          {timeRangeError && <div className="error-message">{timeRangeError}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={appointment.description || ''}
            onChange={handleChange}
            maxLength={500}
            rows={4}
          />
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isAllDay"
            name="isAllDay"
            checked={appointment.isAllDay}
            onChange={handleChange}
          />
          <label htmlFor="isAllDay">All Day Event</label>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={appointment.location || ''}
            onChange={handleChange}
            maxLength={200}
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
            disabled={isSubmitting || timeRangeError}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateAppointment;
