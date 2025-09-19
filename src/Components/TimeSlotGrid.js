import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTimeForDisplay, formatDateForInput } from '../utils/dateUtils';
import '../styles/TimeSlotGrid.css';

function TimeSlotGrid({ selectedDate, appointments, selectedAppointmentId, onAppointmentSelect }) {
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

  // Format time in a shorter way for display in appointment slots
  const formatShortTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Effect to scroll to selected appointment or current time
  useEffect(() => {
    if (timeSlotContainerRef.current) {
      // If there's a selected appointment, scroll to it
      if (selectedAppointmentId) {
        const selectedApp = appointments.find(app => app.id === selectedAppointmentId);
        if (selectedApp) {
          const startTime = new Date(selectedApp.startTime);
          const hour = startTime.getHours();
          const minute = startTime.getMinutes();
          
          // Calculate slot index (2 slots per hour)
          const slotIndex = hour * 2 + (minute >= 30 ? 1 : 0);
          
          const timeSlotHeight = 40; // Approximate height of a time slot in pixels
          const scrollPosition = slotIndex * timeSlotHeight - 100; // Scroll a bit above the appointment
          
          timeSlotContainerRef.current.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
          
          // Update the selected appointment for the modal
          setSelectedAppointment(selectedApp);
        }
      } else {
        // Only scroll to current time if viewing today and no appointment is selected
        const isToday = new Date().toDateString() === selectedDate.toDateString();
        
        if (isToday) {
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
      }
    }
  }, [selectedDate, selectedAppointmentId, appointments]);

  // Filter appointments for the selected day
  const dailyAppointments = appointments ? appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  }) : [];

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

  // Function to determine if this is the first slot of an appointment
  const isFirstSlot = (appointment, hour, minute) => {
    const startTime = new Date(appointment.startTime);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    
    return startHour === hour && 
           ((minute === 0 && startMinute < 30) || 
            (minute === 30 && startMinute >= 30));
  };

  // Function to determine if this is the last slot of an appointment
  const isLastSlot = (appointment, hour, minute) => {
    const endTime = new Date(appointment.endTime);
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    
    // Check if this is the last slot for the appointment
    return (hour === endHour && minute === 0 && endMinute <= 30) || 
           (hour === endHour && minute === 30 && endMinute > 30) ||
           (hour === endHour - 1 && minute === 30 && endMinute === 0);
  };

  // Function to determine if this is the middle slot of an appointment
  const isMiddleSlot = (appointment, hour, minute) => {
    return !isFirstSlot(appointment, hour, minute) && !isLastSlot(appointment, hour, minute);
  };

  // Function to calculate the number of slots an appointment spans
  const getAppointmentSlotSpan = (appointment) => {
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    
    // Calculate the difference in minutes
    const diffMinutes = (endTime - startTime) / (1000 * 60);
    
    // Each slot is 30 minutes, so divide by 30 to get the number of slots
    return Math.ceil(diffMinutes / 30);
  };

  // Function to check if an appointment is back-to-back with another
  const isBackToBackAppointment = (appointment, hour, minute) => {
    // Check if there's another appointment that ends exactly when this one starts
    // or starts exactly when this one ends
    const appointmentStartTime = new Date(appointment.startTime);
    const appointmentEndTime = new Date(appointment.endTime);
    
    return dailyAppointments.some(otherApp => {
      if (otherApp.id === appointment.id) return false; // Skip comparing with itself
      
      const otherStartTime = new Date(otherApp.startTime);
      const otherEndTime = new Date(otherApp.endTime);
      
      // Check if this appointment starts exactly when another ends
      // or ends exactly when another starts
      return (
        appointmentStartTime.getTime() === otherEndTime.getTime() ||
        appointmentEndTime.getTime() === otherStartTime.getTime()
      );
    });
  };

  // Function to determine if we should show appointment info in this slot
  const shouldShowAppointmentInfo = (appointment, hour, minute) => {
    // Always show info in the first slot for simplicity and consistency
    return isFirstSlot(appointment, hour, minute);
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
    
    // Use formatDateForInput from dateUtils.js to format dates for the form
    const formattedStartTime = formatDateForInput(startTime.toISOString());
    const formattedEndTime = formatDateForInput(endTime.toISOString());
    
    // Navigate to the create appointment form with pre-filled times
    window.location.href = `/create?startTime=${encodeURIComponent(formattedStartTime)}&endTime=${encodeURIComponent(formattedEndTime)}`;
  };

  // Handle click on an appointment to view details
  const handleAppointmentClick = (e, appointment) => {
    e.stopPropagation(); // Prevent triggering the time slot click
    setSelectedAppointment(appointment);
    onAppointmentSelect(appointment.id);
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

  // Function to scroll to current time
  const scrollToCurrentTime = () => {
    if (timeSlotContainerRef.current) {
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
  };

  // Automatically scroll to current time when viewing today
  useEffect(() => {
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    if (isToday && !selectedAppointmentId) {
      scrollToCurrentTime();
    }
  }, [selectedDate]);

  return (
    <div className="time-slot-grid">
      <div className="time-grid-header">
        <h2>{formatDateHeader(selectedDate)}</h2>
        <Link to="/create" className="create-appointment-btn">
          + New Appointment
        </Link>
      </div>
      
      <div className="time-slots-container" ref={timeSlotContainerRef}>
        {timeSlots.map((slot, index) => {
          const slotAppointments = getAppointmentsForTimeSlot(slot.hour, slot.minute);
          const isCurrentTime = isCurrentTimeSlot(slot.hour, slot.minute);
          
          // Sort appointments so that shorter ones appear on top
          slotAppointments.sort((a, b) => {
            const spanA = getAppointmentSlotSpan(a);
            const spanB = getAppointmentSlotSpan(b);
            return spanA - spanB;
          });
          
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
                
                {slotAppointments.map((appointment, appIndex) => {
                  const appointmentStatus = getAppointmentStatus(appointment);
                  const isFirst = isFirstSlot(appointment, slot.hour, slot.minute);
                  const isLast = isLastSlot(appointment, slot.hour, slot.minute);
                  const showInfo = shouldShowAppointmentInfo(appointment, slot.hour, slot.minute);
                  const slotSpan = getAppointmentSlotSpan(appointment);
                  const spansMultipleSlots = slotSpan > 1;
                  const isBackToBack = isBackToBackAppointment(appointment, slot.hour, slot.minute);
                  
                  // Calculate a slight offset for each appointment to prevent complete overlap
                  // This helps with back-to-back appointments
                  const offsetPercentage = appIndex * 5; // 5% offset per appointment
                  const maxOffset = 20; // Maximum offset percentage
                  const offset = Math.min(offsetPercentage, maxOffset);
                  
                  const appointmentStyle = {
                    zIndex: 5 + appIndex, // Higher z-index for appointments that come later
                    width: `${100 - offset}%`, // Reduce width slightly for each subsequent appointment
                    left: `${offset}%`, // Offset from the left
                  };
                  
                  return (
                    <div 
                      key={appointment.id} 
                      className={`time-slot-appointment status-${appointmentStatus} 
                                 ${appointment.id === selectedAppointmentId ? 'selected-appointment' : ''} 
                                 ${isFirst ? 'first-slot' : ''} 
                                 ${!isFirst && !isLast ? 'middle-slot' : ''}
                                 ${isLast ? 'last-slot' : ''}
                                 ${spansMultipleSlots ? 'spans-multiple-slots' : ''}
                                 ${isBackToBack ? 'back-to-back' : ''}`}
                      onClick={(e) => handleAppointmentClick(e, appointment)}
                      style={appointmentStyle}
                    >
                      {showInfo && (
                        <div className="appointment-content">
                          {/* Only show the title, aligned to the left */}
                          <div className="appointment-title left-aligned">{appointment.title}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
            {selectedAppointment.location && selectedAppointment.location.trim() !== "" && (
              <p className="detail-location">
                <strong>Location:</strong> {selectedAppointment.location}
              </p>
            )}
            {selectedAppointment.description && selectedAppointment.description.trim() !== "" && (
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
