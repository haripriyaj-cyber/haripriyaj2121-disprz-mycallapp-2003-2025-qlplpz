import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateTimeForDisplay, formatDateForInput } from '../utils/dateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faMapMarkerAlt, 
  faAlignLeft, 
  faEdit, 
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import DeleteAppointment from './DeleteAppointment';
import CalendarHeader from './CalendarHeader';
import '../styles/WeeklyView.css';

function WeeklyView({ 
  selectedDate, 
  appointments, 
  selectedAppointmentId, 
  onAppointmentSelect,
  viewMode,
  onViewModeChange,
  navigateWeek,
  darkMode,
  onDarkModeToggle
}) {
  const navigate = useNavigate();
  const weekGridRef = useRef(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [localAppointments, setLocalAppointments] = useState(appointments);
  
  // Update local appointments when props change
  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);
  
  // Get the start and end dates of the week
  const getWeekDates = (date) => {
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    const diff = date.getDate() - day;
    
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      weekDates.push(currentDate);
    }
    
    return weekDates;
  };
  
  const weekDates = getWeekDates(selectedDate);
  
  // Format the week range for display (e.g., "May 1 - 7, 2023")
  const formatWeekRange = () => {
    const firstDay = weekDates[0];
    const lastDay = weekDates[6];
    
    const firstMonth = firstDay.toLocaleString('default', { month: 'short' });
    const lastMonth = lastDay.toLocaleString('default', { month: 'short' });
    
    const firstYear = firstDay.getFullYear();
    const lastYear = lastDay.getFullYear();
    
    if (firstMonth === lastMonth && firstYear === lastYear) {
      return `${firstMonth} ${firstDay.getDate()} - ${lastDay.getDate()}, ${firstYear}`;
    } else if (firstYear === lastYear) {
      return `${firstMonth} ${firstDay.getDate()} - ${lastMonth} ${lastDay.getDate()}, ${firstYear}`;
    } else {
      return `${firstMonth} ${firstDay.getDate()}, ${firstYear} - ${lastMonth} ${lastDay.getDate()}, ${lastYear}`;
    }
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  // Get appointments for a specific day
  const getAppointmentsForDay = (date) => {
    return localAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate.toDateString() === date.toDateString();
    });
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
  
  // Determine appointment status
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
  
  // Calculate position and height for an appointment in the weekly view
  const calculateEventPosition = (appointment) => {
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    
    // Each slot is 40px high (30 minutes)
    const slotHeight = 40;
    
    // Calculate the exact position based on hours and minutes
    const hourPosition = startHour * (slotHeight * 2); // Each hour has 2 slots
    const minutePosition = (startMinute / 30) * slotHeight; // Proportional position within the half-hour
    
    const top = hourPosition + minutePosition;
    
    // Calculate end position the same way
    const endHourPosition = endHour * (slotHeight * 2);
    const endMinutePosition = (endMinute / 30) * slotHeight;
    
    const bottom = endHourPosition + endMinutePosition;
    
    // Ensure minimum height for text visibility (at least 40px or enough for the content)
    const height = Math.max(bottom - top, slotHeight);
    
    return { top, height };
  };
  
  // Handle click on an appointment
  const handleAppointmentClick = (e, appointment) => {
    e.stopPropagation();
    setShowDetails(true);
    setSelectedAppointment(appointment);
    onAppointmentSelect(appointment.id);
  };
  
  // Handle click on "New Appointment" button
  const navigateToNewAppointment = () => {
    navigate('/create');
  };
  
  // Function to determine if this is the first slot of an appointment
  const isFirstSlot = (appointment, date) => {
    const startTime = new Date(appointment.startTime);
    const appointmentDate = startTime.toDateString();
    
    return date.toDateString() === appointmentDate;
  };
  
  // Function to determine if this is the last slot of an appointment
  const isLastSlot = (appointment, date) => {
    const endTime = new Date(appointment.endTime);
    const appointmentDate = endTime.toDateString();
    
    return date.toDateString() === appointmentDate;
  };
  
  // Function to check if a time slot is in the past
  const isTimeSlotInPast = (date, hour, minute) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    return slotTime < new Date();
  };
  
  // Handle click on a time slot to create a new appointment
  const handleTimeSlotClick = (date, hour, minute) => {
    const startTime = new Date(date);
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
  
  // Scroll to current time on initial render
  useEffect(() => {
    if (weekGridRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const slotIndex = currentHour * 2 + (currentMinute >= 30 ? 1 : 0);
      const slotHeight = 40;
      const scrollPosition = slotIndex * slotHeight - 100;
      
      weekGridRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, []);
  
  // Custom inline styles to override the border
  const timeSlotStyle = {
    borderBottom: 'none'
  };
  
  // Function to get custom style for time labels based on the time
  const getTimeLabelStyle = (hour, minute) => {
    // Base style for all time labels
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '10px',
      height: '40px',
      position: 'relative',
    };
    
    // For 12 AM specifically, adjust to be at the top
    if (hour === 0 && minute === 0) {
      return {
        ...baseStyle,
        marginTop: '-5px',
      };
    }
    
    return baseStyle;
  };
  
  // Appointment Details Modal Component
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
  
  return (
    <div className={`weekly-view-container ${darkMode ? 'dark-mode' : ''}`}>
      <CalendarHeader
        title={formatWeekRange()}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onNavigatePrevious={() => navigateWeek(-1)}
        onNavigateNext={() => navigateWeek(1)}
        navigationType="week"
        darkMode={darkMode}
        onDarkModeToggle={onDarkModeToggle}
      />
      
      <div className="week-days-header">
        <div className="time-label-spacer"></div>
        
        {weekDates.map((date, index) => (
          <div 
            key={index} 
            className={`week-day-column ${isToday(date) ? 'today' : ''}`}
            style={{ flex: '1', minWidth: '0' }}
          >
            <div className="week-day-name">
              {date.toLocaleString('default', { weekday: 'short' })}
            </div>
            <div className="week-day-date">
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>
      
      <div className="week-grid-container" ref={weekGridRef}>
        <div className="week-time-labels">
          {timeSlots.map((slot, index) => (
            <div 
              key={index} 
              className={`week-time-label ${slot.minute === 30 ? 'half-hour' : 'hour'}`}
              style={getTimeLabelStyle(slot.hour, slot.minute)}
            >
              {slot.time}
            </div>
          ))}
        </div>
        
        <div className="week-grid" style={{ minHeight: timeSlots.length * 40 + 'px' }}>
          {weekDates.map((date, dateIndex) => {
            const dayAppointments = getAppointmentsForDay(date);
            
            return (
              <div 
                key={dateIndex} 
                className="week-day-column-content"
                style={{ 
                  borderRight: dateIndex < weekDates.length - 1 ? '1px solid #eaeaea' : 'none',
                  minHeight: timeSlots.length * 40 + 'px'
                }}
              >
                {/* Time slots */}
                {timeSlots.map((slot, slotIndex) => {
                  const isCurrentTimeSlot = () => {
                    const now = new Date();
                    const today = now.toDateString();
                    const selectedDay = date.toDateString();
                    
                    if (today !== selectedDay) return false;
                    
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    
                    return currentHour === slot.hour && 
                           ((slot.minute === 0 && currentMinute < 30) || 
                            (slot.minute === 30 && currentMinute >= 30));
                  };
                  
                  const isPastTimeSlot = isTimeSlotInPast(date, slot.hour, slot.minute);
                  
                  // Add a specific style for the time slot to ensure proper alignment
                  const timeSlotStyle = {
                    position: 'relative',
                    height: '40px',
                    borderTop: slot.minute === 0 ? '1px solid #eaeaea' : 'none',
                    borderBottom: 'none',
                    cursor: isPastTimeSlot ? 'default' : 'pointer'
                  };
                  
                  return (
                    <div 
                      key={slotIndex} 
                      className={`week-time-slot ${slot.minute === 0 ? 'hour-slot' : 'half-hour-slot'} 
                                ${isCurrentTimeSlot() ? 'current-time-slot' : ''} 
                                ${isPastTimeSlot ? 'past' : ''}`}
                      style={timeSlotStyle}
                      onClick={() => !isPastTimeSlot && handleTimeSlotClick(date, slot.hour, slot.minute)}
                    >
                      {isCurrentTimeSlot() && <div className="current-time-indicator"></div>}
                    </div>
                  );
                })}
                
                {/* Appointments */}
                {dayAppointments.map((appointment, appIndex) => {
                  const { top, height } = calculateEventPosition(appointment);
                  const status = getAppointmentStatus(appointment);
                  const startTime = new Date(appointment.startTime);
                  const isFirst = isFirstSlot(appointment, date);
                  const isLast = isLastSlot(appointment, date);
                  
                  // Calculate offset for overlapping appointments
                  const offsetPercentage = appIndex * 5;
                  const maxOffset = 20;
                  const offset = Math.min(offsetPercentage, maxOffset);
                  
                  // Create a style object with precise positioning
                  const appointmentStyle = {
                    top: `${top}px`,
                    height: `${height}px`,
                    width: `calc(100% - ${offset}%)`, // Use calc for more precise width
                    left: `${offset}%`,
                    boxSizing: 'border-box',
                    position: 'absolute',
                    zIndex: 5 + appIndex,
                    margin: 0,
                    padding: '4px 8px',
                    // Add background color directly in the style to ensure it's applied
                    backgroundColor: status === 'attended' ? '#e2e3e5' : 
                                    status === 'recent' ? '#d1e7dd' : 
                                    '#cfe2ff',
                    borderLeft: `3px solid ${
                      status === 'attended' ? '#495057' : 
                      status === 'recent' ? '#28a745' : 
                      '#007bff'
                    }`,
                  };
                  
                  return (
                    <div 
                      key={appointment.id}
                      className={`week-event status-${status} 
                                 ${appointment.id === selectedAppointmentId ? 'selected' : ''} 
                                 ${isFirst ? 'first-slot' : ''} 
                                 ${!isFirst && !isLast ? 'middle-slot' : ''}
                                 ${isLast ? 'last-slot' : ''}`}
                      style={appointmentStyle}
                      onClick={(e) => handleAppointmentClick(e, appointment)}
                    >
                      <div className="week-event-time">
                        {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="week-event-title">{appointment.title}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Appointment Details Modal */}
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

export default WeeklyView;