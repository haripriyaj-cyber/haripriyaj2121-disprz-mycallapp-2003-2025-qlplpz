import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateTimeForDisplay, formatDateForInput } from '../utils/dateUtils';
import DeleteAppointment from './DeleteAppointment';
import CalendarHeader from './CalendarHeader'; // Import the common header
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrashAlt, 
  faClock, 
  faMapMarkerAlt, 
  faAlignLeft
} from '@fortawesome/free-solid-svg-icons';
import { useDarkMode } from '../contexts/DarkModeContext';
import '../styles/TimeSlotGrid.css';

// Extract the appointment details modal to a separate component
function AppointmentDetailsModal({ appointment, onClose, onAppointmentDeleted }) {
  if (!appointment) return null;
  
  // Check if appointment is in the past
  const isAppointmentInPast = () => {
    const endTime = new Date(appointment.endTime);
    return endTime < new Date();
  };
  
  const isPastAppointment = isAppointmentInPast();
  
  const handleAppointmentDeleted = (deletedId) => {
    // Call the parent's onAppointmentDeleted function
    if (onAppointmentDeleted) {
      onAppointmentDeleted(deletedId);
    }
    // Close the modal
    onClose();
  };
  
  return (
    <div className="appointment-details-overlay">
      <div className="appointment-details-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>{appointment.title}</h3>
        <p className="detail-time">
          <strong><FontAwesomeIcon icon={faClock} /> Start:</strong> {formatDateTimeForDisplay(appointment.startTime)}
        </p>
        <p className="detail-time">
          <strong><FontAwesomeIcon icon={faClock} /> End:</strong> {formatDateTimeForDisplay(appointment.endTime)}
        </p>
        {appointment.location && appointment.location.trim() !== "" && (
          <p className="detail-location">
            <strong><FontAwesomeIcon icon={faMapMarkerAlt} /> Location:</strong> {appointment.location}
          </p>
        )}
        {appointment.description && appointment.description.trim() !== "" && (
          <div className="detail-description">
            <strong><FontAwesomeIcon icon={faAlignLeft} /> Description:</strong>
            <p>{appointment.description}</p>
          </div>
        )}
        <div className="detail-actions">
          {!isPastAppointment && (
            <Link 
              to={`/update-appointment/${appointment.id}`} 
              className="edit-btn"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit
            </Link>
          )}
          {isPastAppointment && (
            <span className="edit-btn disabled">
              <FontAwesomeIcon icon={faEdit} /> Edit
            </span>
          )}
          <div className="delete-btn-container">
            {!isPastAppointment ? (
              <DeleteAppointment 
                appointmentId={appointment.id} 
                onAppointmentDeleted={handleAppointmentDeleted}
                useIcon={true}
                icon={faTrashAlt}
              />
            ) : (
              <button 
                className="delete-icon-btn disabled" 
                disabled={true}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeSlotGrid({ 
  selectedDate, 
  appointments, 
  selectedAppointmentId, 
  onAppointmentSelect,
  viewMode,
  onViewModeChange,
  navigateDay,  // Add this prop for day navigation
}) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [localAppointments, setLocalAppointments] = useState(appointments);
  const timeSlotContainerRef = useRef(null);
  const navigate = useNavigate();
  const { darkMode } = useDarkMode(); // Use the dark mode context

  // Add function to handle day navigation if not provided as prop
  const handleDayNavigation = (direction) => {
    if (navigateDay) {
      navigateDay(direction);
    } else {
      // Default implementation if prop not provided
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + direction);
      // You would need to implement a way to update the parent component's state
      // This is just a placeholder
      console.log("Navigate to date:", newDate);
    }
  };

  // Update local appointments when props change
  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  // Listen for custom event from LeftPanel
  useEffect(() => {
    const handleHighlightTimeSlot = (event) => {
      const { appointmentId } = event.detail;
      setShowDetails(false);
      
      const appointment = localAppointments.find(app => app.id === appointmentId);
      if (appointment) {
        const startTime = new Date(appointment.startTime);
        const hour = startTime.getHours();
        const minute = startTime.getMinutes();
        
        const slotIndex = hour * 2 + (minute >= 30 ? 1 : 0);
        const timeSlotHeight = 40;
        const scrollPosition = slotIndex * timeSlotHeight - 100;
        
        if (timeSlotContainerRef.current) {
          timeSlotContainerRef.current.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('highlightTimeSlot', handleHighlightTimeSlot);
    return () => {
      document.removeEventListener('highlightTimeSlot', handleHighlightTimeSlot);
    };
  }, [localAppointments]);

  // Function to check if a time slot is in the past
  const isTimeSlotInPast = (hour, minute) => {
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hour, minute, 0, 0);
    return slotTime < new Date();
  };

  // Generate time slots for all 24 hours with half-hour intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        time: `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
        hour: hour,
        minute: 0
      });
      
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

  // Effect to scroll to selected appointment or current time
  useEffect(() => {
    if (timeSlotContainerRef.current) {
      if (selectedAppointmentId) {
        const selectedApp = localAppointments.find(app => app.id === selectedAppointmentId);
        if (selectedApp) {
          const startTime = new Date(selectedApp.startTime);
          const hour = startTime.getHours();
          const minute = startTime.getMinutes();
          
          const slotIndex = hour * 2 + (minute >= 30 ? 1 : 0);
          const timeSlotHeight = 40;
          const scrollPosition = slotIndex * timeSlotHeight - 100;
          
          timeSlotContainerRef.current.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
          
          if (showDetails) {
            setSelectedAppointment(selectedApp);
          }
        }
      } else {
        const isToday = new Date().toDateString() === selectedDate.toDateString();
        
        if (isToday) {
          scrollToCurrentTime();
        }
      }
    }
  }, [selectedDate, selectedAppointmentId, localAppointments, showDetails]);

  // Filter appointments for the selected day
  const dailyAppointments = localAppointments ? localAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  }) : [];

  // Function to determine appointment status
  const getAppointmentStatus = (appointment) => {
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    
    if (endTime < now) {
      return "attended";
    } else if (startTime < now && endTime > now) {
      return "recent";
    } else {
      return "upcoming";
    }
  };

  // Function to check if an appointment falls within a time slot
  const getAppointmentsForTimeSlot = (hour, minute) => {
    return dailyAppointments.filter(appointment => {
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, minute, 0, 0);
      
      const slotEnd = new Date(slotStart);
      if (minute === 30) {
        slotEnd.setHours(hour + 1, 0, 0, 0);
      } else {
        slotEnd.setHours(hour, 30, 0, 0);
      }
      
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
    
    return (hour === endHour && minute === 0 && endMinute <= 30) || 
           (hour === endHour && minute === 30 && endMinute > 30) ||
           (hour === endHour - 1 && minute === 30 && endMinute === 0);
  };

  // Function to calculate the number of slots an appointment spans
  const getAppointmentSlotSpan = (appointment) => {
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    
    const diffMinutes = (endTime - startTime) / (1000 * 60);
    return Math.ceil(diffMinutes / 30);
  };

  // Function to check if an appointment is back-to-back with another
  const isBackToBackAppointment = (appointment, hour, minute) => {
    const appointmentStartTime = new Date(appointment.startTime);
    const appointmentEndTime = new Date(appointment.endTime);
    
    return dailyAppointments.some(otherApp => {
      if (otherApp.id === appointment.id) return false;
      
      const otherStartTime = new Date(otherApp.startTime);
      const otherEndTime = new Date(otherApp.endTime);
      
      return (
        appointmentStartTime.getTime() === otherEndTime.getTime() ||
        appointmentEndTime.getTime() === otherStartTime.getTime()
      );
    });
  };

  // Function to determine if we should show appointment info in this slot
  const shouldShowAppointmentInfo = (appointment, hour, minute) => {
    return isFirstSlot(appointment, hour, minute);
  };

  // Handle click on a time slot to create a new appointment
  const handleTimeSlotClick = (hour, minute) => {
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, minute, 0, 0);
    
    // Check if the selected time is in the past
    const now = new Date();
    if (startTime < now) {
      // Don't navigate to create appointment for past time slots
      return;
    }
    
    const endTime = new Date(startTime);
    if (minute === 30) {
      endTime.setHours(hour + 1, 0, 0, 0);
    } else {
      endTime.setHours(hour, 30, 0, 0);
    }
    
    const formattedStartTime = formatDateForInput(startTime.toISOString());
    const formattedEndTime = formatDateForInput(endTime.toISOString());
    
    navigate(`/create?startTime=${encodeURIComponent(formattedStartTime)}&endTime=${encodeURIComponent(formattedEndTime)}`);
  };

  // Handle click on an appointment to view details
  const handleAppointmentClick = (e, appointment) => {
    e.stopPropagation();
    setShowDetails(true);
    setSelectedAppointment(appointment);
    onAppointmentSelect(appointment.id);
  };

  // Close appointment details modal
  const closeAppointmentDetails = () => {
    setSelectedAppointment(null);
    setShowDetails(true);
  };

  // Handle appointment deletion
  const handleAppointmentDeleted = (deletedId) => {
    // Update local state immediately to remove the appointment
    setLocalAppointments(prevAppointments => 
      prevAppointments.filter(app => app.id !== deletedId)
    );
    
    // If the deleted appointment was selected, clear the selection
    if (selectedAppointmentId === deletedId) {
      onAppointmentSelect(null);
    }
    
    // Close the modal
    setSelectedAppointment(null);
    
    // Create a custom event to notify other components about the deletion
    const customEvent = new CustomEvent('appointmentDeleted', {
      detail: { appointmentId: deletedId }
    });
    document.dispatchEvent(customEvent);
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
      
      const slotIndex = currentHour * 2 + (currentMinute >= 30 ? 1 : 0);
      const timeSlotHeight = 40;
      const scrollPosition = slotIndex * timeSlotHeight - 100;
      
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
  }, [selectedDate, selectedAppointmentId]);

  return (
    <div className={`time-slot-grid ${darkMode ? 'dark-mode' : ''}`}>
      {/* Replace the old header with the common CalendarHeader component */}
      <CalendarHeader
        title={formatDateHeader(selectedDate)}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onNavigatePrevious={() => navigateDay(-1)}
        onNavigateNext={() => navigateDay(1)}
        navigationType="day"
      />
      
      <div className="time-slots-container" ref={timeSlotContainerRef}>
        {timeSlots.map((slot, index) => {
          const slotAppointments = getAppointmentsForTimeSlot(slot.hour, slot.minute);
          const isCurrentTime = isCurrentTimeSlot(slot.hour, slot.minute);
          const isPastTimeSlot = isTimeSlotInPast(slot.hour, slot.minute);
          
          slotAppointments.sort((a, b) => {
            const spanA = getAppointmentSlotSpan(a);
            const spanB = getAppointmentSlotSpan(b);
            return spanA - spanB;
          });
          
          return (
            <div 
              key={index} 
              className={`time-slot ${isCurrentTime ? 'current-time-slot' : ''} ${slot.minute === 30 ? 'half-hour-slot' : 'hour-slot'}`}
              id={`timeslot-hour-${slot.hour}-minute-${slot.minute}`}
            >
              <div className="time-label">
                {slot.minute === 0 ? slot.time : <span className="half-hour-label">{slot.time}</span>}
              </div>
              <div 
                className={`time-slot-content ${isPastTimeSlot ? 'past' : ''}`}
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
                  
                  const offsetPercentage = appIndex * 5;
                  const maxOffset = 20;
                  const offset = Math.min(offsetPercentage, maxOffset);
                  
                  const appointmentStyle = {
                    zIndex: 5 + appIndex,
                    width: `${100 - offset}%`,
                    left: `${offset}%`,
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
                      id={`timeslot-${appointment.id}`}
                    >
                      {showInfo && (
                        <div className="appointment-content">
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
      
      {/* Use the extracted AppointmentDetailsModal component with delete functionality */}
      {selectedAppointment && showDetails && (
        <AppointmentDetailsModal 
          appointment={selectedAppointment} 
          onClose={closeAppointmentDetails}
          onAppointmentDeleted={handleAppointmentDeleted}
        />
      )}
    </div>
  );
}

export default TimeSlotGrid;
