import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDateForBackend, validateTimeRange } from '../utils/dateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faSave, 
  faTimes, 
  faClock, 
  faMapMarkerAlt, 
  faAlignLeft, 
  faTag
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AppointmentForm.css';

function AppointmentForm() {
  const navigate = useNavigate();
  const locationHook = useLocation();
  const { currentUser } = useAuth();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(locationHook.search);
  const startTimeParam = queryParams.get('startTime');
  const endTimeParam = queryParams.get('endTime');
  
  const [formData, setFormData] = useState({
    title: '',
    startTime: startTimeParam || '',
    endTime: endTimeParam || '',
    description: '',
    location: ''
  });
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate minimum date-time for the inputs (current time)
  const [minDateTime, setMinDateTime] = useState('');
  
  // Update the minimum date-time when the component mounts
  useEffect(() => {
    updateMinDateTime();
    
    // Handle startTime from URL if provided
    if (startTimeParam) {
      try {
        console.log("Received startTimeParam:", startTimeParam);
        
        // Check if it's just a date (YYYY-MM-DD) or a full datetime
        const isDateOnly = startTimeParam.length <= 10;
        
        // Parse the startTime parameter
        let startDate;
        if (isDateOnly) {
          // If it's just a date, create a date at 9:00 AM
          const [year, month, day] = startTimeParam.split('-').map(num => parseInt(num, 10));
          startDate = new Date(year, month - 1, day, 9, 0, 0);
        } else {
          // If it's a full datetime, parse it directly
          startDate = new Date(startTimeParam);
        }
        
        console.log("Parsed startDate:", startDate);
        
        // Format to YYYY-MM-DDThh:mm
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');
        
        const formattedStartTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        console.log("Formatted startTime:", formattedStartTime);
        
        // Set end time to 30 minutes after start time
        const endDate = new Date(startDate);
        endDate.setMinutes(startDate.getMinutes() + 30);
        
        const formattedEndTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}T${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
        
        // Update form data with the parsed times
        setFormData(prevData => ({
          ...prevData,
          startTime: formattedStartTime,
          endTime: formattedEndTime
        }));
      } catch (error) {
        console.error("Error parsing startTime parameter:", error);
      }
    }
    
    // Update min date-time every minute to keep it current
    const intervalId = setInterval(updateMinDateTime, 60000);
    
    return () => clearInterval(intervalId);
  }, [startTimeParam]); // Add startTimeParam as a dependency
  
  // Function to update the minimum date-time
  const updateMinDateTime = () => {
    const now = new Date();
    // Format to YYYY-MM-DDThh:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setMinDateTime(formattedDateTime);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If changing start time and end time is empty or before the new start time,
    // automatically set end time to start time + 30 minutes
    if (name === 'startTime' && (formData.endTime === '' || new Date(value) >= new Date(formData.endTime))) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setMinutes(startDate.getMinutes() + 30);
      
      // Format to YYYY-MM-DDThh:mm
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');
      const hours = String(endDate.getHours()).padStart(2, '0');
      const minutes = String(endDate.getMinutes()).padStart(2, '0');
      
      const formattedEndTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      setFormData(prevData => ({
        ...prevData,
        endTime: formattedEndTime
      }));
    }
  };

  const checkTimeSlotAvailability = async (startTime, endTime) => {
    try {
      // Fetch all existing appointments
      let url = '/api/appointments';
    
      // If user is logged in, only check conflicts with their appointments
      if (currentUser && currentUser.id) {
        url = `/api/appointments/user/${currentUser.id}`;
      }
    
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const appointments = await response.json();
      
      // Convert input times to Date objects for comparison
      const newStart = new Date(startTime).getTime();
      const newEnd = new Date(endTime).getTime();
      
      // Check for overlaps with existing appointments
      const conflictingAppointment = appointments.find(appointment => {
        const existingStart = new Date(appointment.startTime).getTime();
        const existingEnd = new Date(appointment.endTime).getTime();
        
        // Check if the new appointment overlaps with an existing one
        return (
          (newStart >= existingStart && newStart < existingEnd) || // New start time is within existing appointment
          (newEnd > existingStart && newEnd <= existingEnd) || // New end time is within existing appointment
          (newStart < existingStart && newEnd > existingEnd) // New appointment completely encompasses existing appointment
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
      // Check if the appointment is in the past
      const now = new Date();
      const startTime = new Date(formData.startTime);
      
      if (startTime < now) {
        setMessage('Error: Cannot create appointments in the past. Please select a future time.');
        setIsLoading(false);
        return;
      }
      
      // Format the data for the API with proper time zone handling
      const appointmentData = {
        title: formData.title,
        startTime: formatDateForBackend(formData.startTime),
        endTime: formatDateForBackend(formData.endTime),
        description: formData.description || '',
        isAllDay: false, // Set default value since we removed the checkbox
        location: formData.location || '',
        userId: currentUser?.id || 1 // Use current user ID or default to 1
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
          location: ''
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.detail || errorData.message || 'Failed to create appointment'}`);
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
      <h2><FontAwesomeIcon icon={faCalendarAlt} /> Create New Appointment</h2>
      
      {message && <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
        {message}
      </div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title"><FontAwesomeIcon icon={faTag} /> Title</label>
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
          <label htmlFor="startTime"><FontAwesomeIcon icon={faClock} /> Start Time</label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            min={minDateTime} // Set minimum date-time to current time
            className={formData.startTime && new Date(formData.startTime) < new Date() ? 'past-time' : ''}
          />
          {formData.startTime && new Date(formData.startTime) < new Date() && (
            <div className="error-message">Cannot select a time in the past</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="endTime"><FontAwesomeIcon icon={faClock} /> End Time</label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            min={formData.startTime || minDateTime} // End time should be after start time or current time
            className={formData.endTime && new Date(formData.endTime) < new Date() ? 'past-time' : ''}
          />
          {timeRangeError && <div className="error-message">{timeRangeError}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description"><FontAwesomeIcon icon={faAlignLeft} /> Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            maxLength={500}
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location"><FontAwesomeIcon icon={faMapMarkerAlt} /> Location</label>
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
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={
              isLoading || 
              timeRangeError || 
              (formData.startTime && new Date(formData.startTime) < new Date()) ||
              (formData.endTime && new Date(formData.endTime) < new Date())
            }
          >
            <FontAwesomeIcon icon={faSave} /> {isLoading ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AppointmentForm;
