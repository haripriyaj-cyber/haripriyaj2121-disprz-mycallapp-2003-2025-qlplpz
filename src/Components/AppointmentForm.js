import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDateForBackend, validateTimeRange } from '../utils/dateUtils';
import './AppointmentForm.css';

function AppointmentForm() {
  const navigate = useNavigate();
  const locationHook = useLocation();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(locationHook.search);
  const startTimeParam = queryParams.get('startTime');
  const endTimeParam = queryParams.get('endTime');
  
  const [formData, setFormData] = useState({
    title: '',
    startTime: startTimeParam || '',
    endTime: endTimeParam || '',
    description: '',
    isAllDay: false,
    location: ''
  });
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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
      
      // Check for overlaps with existing appointments
      const conflictingAppointment = appointments.find(appointment => {
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
    setIsLoading(true);
    setMessage('');
    
    try {
      // Format the data for the API with proper time zone handling
      const appointmentData = {
        title: formData.title,
        startTime: formatDateForBackend(formData.startTime),
        endTime: formatDateForBackend(formData.endTime),
        description: formData.description || '',
        isAllDay: formData.isAllDay,
        location: formData.location || ''
      };
      
      // First check if the time slot is available
      const isTimeSlotAvailable = await checkTimeSlotAvailability(
        appointmentData.startTime, 
        appointmentData.endTime
      );
      
      if (!isTimeSlotAvailable) {
        setMessage('Error: This time slot is already booked. Please select a different time.');
        setIsLoading(false);
        return;
      }
      
      // If time slot is available, proceed with creating the appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (response.ok) {
        setMessage('Appointment created successfully!');
        // Reset form
        setFormData({
          title: '',
          startTime: '',
          endTime: '',
          description: '',
          isAllDay: false,
          location: ''
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message || 'Failed to create appointment'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const timeRangeError = validateTimeRange(formData.startTime, formData.endTime);

  return (
    <div className="appointment-form-container">
      <h2>Create New Appointment</h2>
      
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
            value={formData.title}
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
            value={formData.startTime}
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
            value={formData.endTime}
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
            value={formData.description || ''}
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
            checked={formData.isAllDay}
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
            value={formData.location || ''}
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
            disabled={isLoading || timeRangeError}
          >
            {isLoading ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AppointmentForm;
