import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDateForBackend, formatDateForInput, validateTimeRange } from '../utils/dateUtils';
// Use the AppointmentForm CSS instead of UpdateAppointment CSS
import '../styles/AppointmentForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faSave, 
  faTimes, 
  faClock, 
  faMapMarkerAlt, 
  faAlignLeft, 
  faTag,
  faCheckSquare
} from '@fortawesome/free-solid-svg-icons';

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppointment({
      ...appointment,
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
      const newStart = new Date(startTime).getTime();
      const newEnd = new Date(endTime).getTime();
      
      // Check for overlaps with existing appointments, excluding the current appointment
      const conflictingAppointment = appointments.find(appointment => {
        // Skip comparing with the current appointment being edited
        if (appointment.id === parseInt(id)) {
          return false;
        }
        
        const existingStart = new Date(appointment.startTime).getTime();
        const existingEnd = new Date(appointment.endTime).getTime();
        
        // Check if the new appointment overlaps with an existing one
        return (
          (newStart >= existingStart && newStart < existingEnd) || 
          (newEnd > existingStart && newEnd <= existingEnd) || 
          (newStart < existingStart && newEnd > existingEnd)
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
      // Prepare the data for API with proper time zone handling
      const appointmentData = {
        title: appointment.title,
        startTime: formatDateForBackend(appointment.startTime),
        endTime: formatDateForBackend(appointment.endTime),
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
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to update appointment');
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

  const timeRangeError = validateTimeRange(appointment.startTime, appointment.endTime);

  if (isLoading) {
    return <div className="loading">Loading appointment details...</div>;
  }

  // Using the same structure as AppointmentForm.js which is known to work
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
            {isSubmitting ? 'Updating...' : 'Update Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateAppointment;
