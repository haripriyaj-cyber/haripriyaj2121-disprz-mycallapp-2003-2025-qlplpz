import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTimeForDisplay } from '../utils/dateUtils';
import './TimeSlotGrid.css';

function TimeSlotGrid({ selectedDate, appointments }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const timeSlotContainerRef = useRef(null);

  // Generate time slots for all 24 hours with half-hour intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      // Add the full hour slot
      slots.push({
        time: `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
        hour: hour,
        minute: 0
      });
      
      // Add the half hour slot
      slots.push({
        time: `${hour % 12 === 0 ? 12 : hour % 12}:30 ${hour < 12 ? 'AM' : 'PM'}`,
        hour: hour,
        minute: 30
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // Format the date for display in the header
  const formatDateHeader = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Scroll to current time when viewing today's date
  useEffect(() => {
    // Only scroll to current time if viewing today
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    
    if (isToday && timeSlotContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Calculate slot index (2 slots per hour)
      const slotIndex = currentHour * 2 + (currentMinute >= 30 ? 1 : 0);
      
      const timeSlotHeight = 40; // Approximate height of a time slot in pixels
      const scrollPosition = slotIndex * timeSlotHeight - 100; // Scroll a bit above the current time
      
      timeSlotContainerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedDate]);

  // Filter appointments for the selected day
  const dailyAppointments = appointments ? appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  }) : [];

  // Function to check if an appointment falls within a time slot
  const getAppointmentsForTimeSlot = (hour, minute) => {
    return dailyAppointments.filter(appointment => {
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      
      // Create a date object for the current time slot
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, minute, 0, 0);
      
      // Create a date object for the end of this time slot
      const slotEnd = new Date(slotStart);
      if (minute === 30) {
        slotEnd.setHours(hour + 1, 0, 0, 0);
      } else {
        slotEnd.setHours(hour, 30, 0, 0);
      }
      
      // Check if appointment overlaps with this time slot
      return (
        (startTime < slotEnd && endTime > slotStart) || 
        (startTime.getTime() === slotStart.getTime())
      );
    });
  };

  // Function to determine if an appointment should be displayed in this slot
  const shouldDisplayAppointment = (appointment, hour, minute) => {
    const startTime = new Date(appointment.startTime);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    
    // Only display the appointment in the slot where it starts
    return startHour === hour && 
           ((minute === 0 && startMinute < 30) || 
            (minute === 30 && startMinute >= 30));
  };

  // Handle click on a time slot to create a new appointment
  const handleTimeSlotClick = (hour, minute) => {
    // Create a new date object for the selected date at the specified time
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, minute, 0, 0);
    
    // Create an end time 30 minutes later
    const endTime = new Date(startTime);
    if (minute === 30) {
      endTime.setHours(hour + 1, 0, 0, 0);
    } else {
      endTime.setHours(hour, 30, 0, 0);
    }
    // Format the dates for the form in a way that preserves the local time
  // This uses the format expected by datetime-local inputs: YYYY-MM-DDTHH:MM
  const formattedStartTime = startTime.getFullYear() + '-' + 
    String(startTime.getMonth() + 1).padStart(2, '0') + '-' + 
    String(startTime.getDate()).padStart(2, '0') + 'T' + 
    String(startTime.getHours()).padStart(2, '0') + ':' + 
    String(startTime.getMinutes()).padStart(2, '0');
  
  const formattedEndTime = endTime.getFullYear() + '-' + 
    String(endTime.getMonth() + 1).padStart(2, '0') + '-' + 
    String(endTime.getDate()).padStart(2, '0') + 'T' + 
    String(endTime.getHours()).padStart(2, '0') + ':' + 
    String(endTime.getMinutes()).padStart(2, '0');
  
  // Navigate to the create appointment form with pre-filled times
  window.location.href = `/create?startTime=${encodeURIComponent(formattedStartTime)}&endTime=${encodeURIComponent(formattedEndTime)}`;
    
  };

  // Handle click on an appointment to view details
  const handleAppointmentClick = (e, appointment) => {
    e.stopPropagation(); // Prevent triggering the time slot click
    setSelectedAppointment(appointment);
  };

  // Close appointment details modal
  const closeAppointmentDetails = () => {
    setSelectedAppointment(null);
  };

  // Check if a time slot is the current time
  const isCurrentTimeSlot = (hour, minute) => {
    const now = new Date();
    const today = now.toDateString();
    const selectedDay = selectedDate.toDateString();
    
    if (today !== selectedDay) return false;
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    return currentHour === hour && 
           ((minute === 0 && currentMinute < 30) || 
            (minute === 30 && currentMinute >= 30));
  };

  // Function to scroll to a specific time period
  const scrollToTimePeriod = (hour) => {
    if (timeSlotContainerRef.current) {
      const timeSlotHeight = 40; // Approximate height of a time slot in pixels
      const scrollPosition = hour * 2 * timeSlotHeight; // 2 slots per hour
      
      timeSlotContainerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="time-slot-grid">
      <div className="time-grid-header">
        <h2>{formatDateHeader(selectedDate)}</h2>
        <Link to="/create" className="create-appointment-btn">
          + New Appointment
        </Link>
      </div>
      
      <div className="time-period-navigation">
        <button onClick={() => scrollToTimePeriod(0)}>Midnight - 6 AM</button>
        <button onClick={() => scrollToTimePeriod(6)}>6 AM - 12 PM</button>
        <button onClick={() => scrollToTimePeriod(12)}>12 PM - 6 PM</button>
        <button onClick={() => scrollToTimePeriod(18)}>6 PM - Midnight</button>
      </div>
      
      <div className="time-slots-container" ref={timeSlotContainerRef}>
        {timeSlots.map((slot, index) => {
          const slotAppointments = getAppointmentsForTimeSlot(slot.hour, slot.minute);
          const isCurrentTime = isCurrentTimeSlot(slot.hour, slot.minute);
          
          return (
            <div 
              key={index} 
              className={`time-slot ${isCurrentTime ? 'current-time-slot' : ''} ${slot.minute === 30 ? 'half-hour-slot' : 'hour-slot'}`}
            >
              <div className="time-label">
                {slot.minute === 0 ? slot.time : <span className="half-hour-label">{slot.time}</span>}
              </div>
              <div 
                className="time-slot-content"
                onClick={() => handleTimeSlotClick(slot.hour, slot.minute)}
              >
                {isCurrentTime && <div className="current-time-indicator"></div>}
                
                {slotAppointments.map(appointment => (
                  shouldDisplayAppointment(appointment, slot.hour, slot.minute) && (
                    <div 
                      key={appointment.id} 
                      className="time-slot-appointment"
                      onClick={(e) => handleAppointmentClick(e, appointment)}
                    >
                      <div className="appointment-time">
                        {formatDateTimeForDisplay(appointment.startTime).split(' ').slice(-2).join(' ')}
                      </div>
                      <div className="appointment-title">{appointment.title}</div>
                      {appointment.location && (
                        <div className="appointment-location">{appointment.location}</div>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedAppointment && (
        <div className="appointment-details-overlay">
          <div className="appointment-details-modal">
            <button className="close-btn" onClick={closeAppointmentDetails}>×</button>
            <h3>{selectedAppointment.title}</h3>
            <p className="detail-time">
              <strong>Start:</strong> {formatDateTimeForDisplay(selectedAppointment.startTime)}
            </p>
            <p className="detail-time">
              <strong>End:</strong> {formatDateTimeForDisplay(selectedAppointment.endTime)}
            </p>
            {selectedAppointment.location && (
              <p className="detail-location">
                <strong>Location:</strong> {selectedAppointment.location}
              </p>
            )}
            {selectedAppointment.description && (
              <div className="detail-description">
                <strong>Description:</strong>
                <p>{selectedAppointment.description}</p>
              </div>
            )}
            <div className="detail-actions">
              <Link 
                to={`/update-appointment/${selectedAppointment.id}`} 
                className="edit-btn"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeSlotGrid;
